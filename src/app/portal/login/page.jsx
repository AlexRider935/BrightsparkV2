"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      router.push("/portal/dashboard"); // Redirect to dashboard on success
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center pt-24">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-lg">
        <h1 className="text-3xl font-bold text-white mb-2">Student Portal</h1>
        <p className="text-slate mb-8">Please sign in to continue.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="rounded-lg border-0 bg-slate/20 px-4 py-3 text-white placeholder-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-gold/70"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="rounded-lg border-0 bg-slate/20 px-4 py-3 text-white placeholder-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-gold/70"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-gold py-3 font-bold text-dark-navy transition-transform duration-300 hover:scale-105">
            Sign In
          </button>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </form>
      </div>
    </div>
  );
}
