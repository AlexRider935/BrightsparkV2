"use client";

import { useState } from "react";
import { Database } from "lucide-react";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSeed = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/seed");
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
      } else {
        setError(data.message || "An unknown error occurred.");
      }
    } catch (err) {
      setError("Failed to connect to the seeder API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-lg">
        <Database className="mx-auto h-10 w-10 text-brand-gold" />
        <h1 className="mt-4 text-2xl font-bold text-white">Database Seeder</h1>
        <p className="mt-2 text-slate">
          Click the button below to populate your Firestore database with sample
          teachers and courses. Use this only once.
        </p>
        <button
          onClick={handleSeed}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-brand-gold py-3 font-bold text-dark-navy transition-all hover:scale-105 disabled:cursor-not-allowed disabled:bg-slate-600">
          {loading ? "Seeding..." : "Seed Database"}
        </button>
        {message && <p className="mt-4 text-sm text-green-400">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
