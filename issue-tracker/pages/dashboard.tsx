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

  async function fetchIssues() {
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
    fetchIssues();

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
          console.log("Realtime change:", payload);
          fetchIssues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function addIssue() {
    if (!title || !description) return;

    setLoading(true);
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
    setLoading(false);
  }

  async function deleteIssue(issueId: number) {
    const confirmDelete = confirm("Are you sure you want to delete this issue?");
    if (!confirmDelete) return;

    setLoading(true);
    const { error } = await supabase.from("issues").delete().eq("id", issueId);

    if (error) {
      toast.error("Error deleting issue: " + error.message);
    } else {
      toast.success("Issue deleted");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Issues</h1>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          className="bg-gray-200 text-sm px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          Logout
        </button>
      </div>

      {/* FILTER + STATS */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        {/* Filter */}
        <div>
          <label className="mr-2 font-medium">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "All" | "Open" | "In Progress" | "Closed")
            }
            className="border rounded px-2 py-1"
          >
            <option value="All">All</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-gray-700">
          <span>Total: {issues.length}</span>
          <span>Open: {issues.filter((i) => i.status === "Open").length}</span>
          <span>In Progress: {issues.filter((i) => i.status === "In Progress").length}</span>
          <span>Closed: {issues.filter((i) => i.status === "Closed").length}</span>
        </div>
      </div>

      {/* ADD ISSUE */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Issue title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <textarea
          placeholder="Issue description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded w-full mb-2"
          rows={4}
        />
        <button
          onClick={addIssue}
          className="bg-blue-600 text-white py-2 px-4 rounded"
          disabled={loading}
        >
          Add Issue
        </button>
      </div>

      {/* ISSUE LIST */}
      {loading && <p>Loading...</p>}
      {!loading && issues.length === 0 && <p>No issues yet.</p>}

      <ul>
        {issues
          .filter((issue) =>
            statusFilter === "All" ? true : issue.status === statusFilter
          )
          .map((issue) => (
            <li key={issue.id} className="border p-4 rounded mb-4">
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
                    setLoading(true);
                    const { error } = await supabase
                      .from("issues")
                      .update({ status: newStatus })
                      .eq("id", issue.id);
                    if (error) toast.error("Failed to update status: " + error.message);
                    else toast.success("Status updated!");
                    setLoading(false);
                  }}
                  className="border rounded px-2 py-1 mt-1"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </label>

              <button
                onClick={() => deleteIssue(issue.id)}
                className="mt-3 bg-red-600 text-white px-3 py-1 rounded"
                disabled={loading}
              >
                Delete
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
