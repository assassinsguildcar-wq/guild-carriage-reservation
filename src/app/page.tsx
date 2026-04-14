"use client";

import { useState } from "react";

export default function Home() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setMessage("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        body: JSON.stringify({ password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        window.location.href = "/calendar";
      } else {
        const data = await res.json().catch(() => null);
        setMessage(data?.error || "Incorrect password.");
      }
    } catch {
      setMessage("Connection error.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0b08] text-[#f2e7cf] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[720px] rounded-3xl border border-[#7a5b1f] bg-[#17110c] shadow-2xl px-6 py-8 md:px-10 md:py-10">
        <div className="flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="ASSASSINS"
            className="w-28 h-28 md:w-32 md:h-32 object-contain mb-5"
          />

          <p className="text-xs md:text-sm tracking-[0.3em] text-[#b89347] uppercase">
            Assassins Guild
          </p>

          <h1 className="mt-3 text-3xl md:text-5xl font-bold text-[#f7ecd3]">
            Guild Carriage Reservation
          </h1>

          <p className="mt-4 text-base md:text-xl text-[#d2bf97]">
            Manage carriage duty assignments for guild members.
          </p>

          <p className="mt-2 text-sm md:text-base text-[#a88c57]">
            Authorized members only
          </p>

          <p className="mt-6 text-lg md:text-2xl font-semibold text-[#e0c06b]">
            Enter Guild Password
          </p>
        </div>

        <div className="mt-6 mx-auto w-full max-w-[560px] flex flex-col gap-4">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
            className="w-full h-[72px] md:h-[84px] rounded-2xl border-2 border-[#c79a35] bg-[#0b0806] text-[#f7ecd3] text-center text-[30px] md:text-[36px] placeholder:text-[#7f6a43] outline-none box-border focus:ring-4 focus:ring-[#c79a35]/25 transition"
          />

          <button
            onClick={handleLogin}
            className="group relative w-full h-[72px] md:h-[84px] overflow-hidden rounded-2xl border-2 border-[#c79a35] bg-gradient-to-b from-[#d8b35a] to-[#9a6d23] text-[#120d07] text-[30px] md:text-[36px] font-bold box-border transition duration-200 hover:brightness-110 hover:shadow-[0_0_30px_rgba(215,170,70,0.35)] active:scale-[0.99]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative z-10">Enter</span>
          </button>

          <div className="mt-2 min-h-7 text-center text-base md:text-lg text-[#de8b8b]">
            {message}
          </div>
        </div>
      </div>
    </main>
  );
}