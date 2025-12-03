"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: any) => {
    e.preventDefault();
    router.push("/dashboard"); // fake login redirect
  };

  return (
    <main className="h-screen w-full flex items-center justify-center bg-[#0d1b2a] relative overflow-hidden">

      {/* Blueprint grid */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graph-paper.png')] opacity-20"></div>

      {/* Neon glow lines */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 border border-cyan-400/40 rounded-xl"></div>
        <div className="absolute bottom-14 right-14 w-52 h-52 border border-cyan-400/40 rounded-xl"></div>
      </div>

      {/* Glass card */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/20 shadow-2xl rounded-2xl p-10 w-[380px] text-center">

        <h1 className="text-3xl font-bold text-cyan-400 mb-2 tracking-wide">
          MechaMind AI
        </h1>
        <p className="text-cyan-100 mb-8 text-sm opacity-80">
          Precision. Performance. Progress.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col space-y-5">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/10 text-white outline-none focus:ring-2 ring-cyan-400 transition"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/10 text-white outline-none focus:ring-2 ring-cyan-400 transition"
          />

          <button
            type="submit"
            className="w-full p-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}
