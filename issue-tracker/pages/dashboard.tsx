"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

type Issue = {
  id: number;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Closed";
};

const statusColors = {
  Open: "bg-green-100 text-green-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Closed: "bg-gray-200 text-gray-800",
};

export default function Dashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "In Progress" | "Closed">("All");

  async function fetchInitialIssues() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if (!error && data) setIssues(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchInitialIssues();

    const channel = supabase
      .channel("realtime-issues")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "issues",
        },
        (payload) => {
          const newIssue = payload.new as Issue;
          const oldIssue = payload.old as Issue;

          setIssues((prevIssues) => {
            switch (payload.eventType) {
              case "INSERT":
                return [newIssue, ...prevIssues];
              case "UPDATE":
                return prevIssues.map((i) => (i.id === newIssue.id ? newIssue : i));
              case "DELETE":
                return prevIssues.filter((i) => i.id !== oldIssue.id);
              default:
                return prevIssues;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function addIssue() {
    if (!title || !description) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("issues").insert([
      {
        title,
        description,
        status: "Open",
        user_id: user.id,
      },
    ]);

    if (!error) {
      setTitle("");
      setDescription("");
      toast.success("Issue added!");
    } else {
      toast.error("Failed to add issue: " + error.message);
    }
  }

  async function deleteIssue(issueId: number) {
    const confirmDelete = confirm("Are you sure you want to delete this issue?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("issues").delete().eq("id", issueId);
    if (error) {
      toast.error("Error deleting issue: " + error.message);
    } else {
      toast.success("Issue deleted");
    }
  }

  return (
    <div className="min-h-screen bg-[#1a001f] text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#ff33cc]">Your Issues</h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="bg-[#ff33cc] text-white text-sm px-4 py-2 rounded hover:bg-pink-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Filter & Stats */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <div>
            <label className="mr-2 font-medium">Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "All" | "Open" | "In Progress" | "Closed")
              }
              className="border rounded px-2 py-1 bg-[#2a0036] text-white"
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex gap-4 text-sm">
            <span>Total: {issues.length}</span>
            <span>Open: {issues.filter((i) => i.status === "Open").length}</span>
            <span>In Progress: {issues.filter((i) => i.status === "In Progress").length}</span>
            <span>Closed: {issues.filter((i) => i.status === "Closed").length}</span>
          </div>
        </div>

        {/* Add Form */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Issue title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded w-full mb-2 bg-[#2a0036] text-white"
          />
          <textarea
            placeholder="Issue description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded w-full mb-2 bg-[#2a0036] text-white"
            rows={4}
          />
          <button
            onClick={addIssue}
            className="bg-[#ff33cc] text-white py-2 px-4 rounded hover:bg-pink-600 transition"
          >
            Add Issue
          </button>
        </div>

        {/* Issues Grid */}
        {loading && <p>Loading...</p>}
        {!loading && issues.length === 0 && <p>No issues yet.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {issues
            .filter((issue) =>
              statusFilter === "All" ? true : issue.status === statusFilter
            )
            .map((issue) => (
              <div key={issue.id} className="border p-4 rounded shadow bg-[#2a0036]">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-xl">{issue.title}</h2>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${statusColors[issue.status]}`}
                  >
                    {issue.status}
                  </span>
                </div>
                <p className="mt-1">{issue.description}</p>

                <label className="block mt-3">
                  Change Status:{" "}
                  <select
                    value={issue.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value as "Open" | "In Progress" | "Closed";
                      const { error } = await supabase
                        .from("issues")
                        .update({ status: newStatus })
                        .eq("id", issue.id);
                      if (error) toast.error("Failed to update status: " + error.message);
                      else toast.success("Status updated!");
                    }}
                    className="border rounded px-2 py-1 mt-1 bg-[#1a001f] text-white"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </label>

                <button
                  onClick={() => deleteIssue(issue.id)}
                  className="mt-3 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
