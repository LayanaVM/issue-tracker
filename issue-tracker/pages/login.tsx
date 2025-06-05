// pages/login.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message || "Login failed");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a001f] font-sans">
      <div className="bg-[#2d0036] p-8 rounded-xl shadow-xl w-full max-w-md text-white">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-[#ff33cc]">Login</h1>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 rounded bg-[#1a001f] text-white border border-[#ff33cc] placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-6 rounded bg-[#1a001f] text-white border border-[#ff33cc] placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="submit"
            className="w-full bg-[#ff33cc] text-white font-semibold py-2 rounded hover:bg-pink-600 transition"
          >
            Log In
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-300">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#ff33cc] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
