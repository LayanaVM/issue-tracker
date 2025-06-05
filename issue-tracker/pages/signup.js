import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a001f] font-sans">
      <div className="bg-[#2d0036] p-8 rounded-xl shadow-xl w-full max-w-md text-white">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-[#ff33cc]">Sign Up</h1>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSignup}>
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
            autoComplete="new-password"
          />
          <button
            type="submit"
            className="w-full bg-[#ff33cc] text-white font-semibold py-2 rounded hover:bg-pink-600 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-300">
          Already have an account?{" "}
          <Link href="/login" className="text-[#ff33cc] hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
