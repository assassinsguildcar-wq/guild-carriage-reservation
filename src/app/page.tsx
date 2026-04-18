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
    <div
      style={{
        minHeight: "100vh",
        background: "#000000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <div className="gc-card">
        <img
          src="/logo.png"
          alt="ASSASSINS"
          className="gc-logo"
        />

        <p className="gc-guild">ASSASSINS GUILD</p>

        <h1 className="gc-title">Guild Carriage Reservation</h1>

        <p className="gc-subtitle">
          Manage carriage duty assignments for guild members.
        </p>

        <p className="gc-auth">Authorized members only</p>

        <p className="gc-label">Enter Guild Password</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="gc-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
        />

        <button onClick={handleLogin} className="gc-button">
          Enter
        </button>

        {message && <p className="gc-error">{message}</p>}
      </div>
    </div>
  );
}