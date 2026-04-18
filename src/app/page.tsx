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
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      
      {/* 🔥 これで反映確認 */}
      <p style={{ color: "red", fontSize: "32px", fontWeight: 700 }}>
        LOGIN_TEST_002
      </p>

      <h1>Guild Carriage Reservation</h1>

      <p>Enter Guild Password</p>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "10px", fontSize: "16px" }}
      />

      <br /><br />

      <button
        onClick={handleLogin}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Enter
      </button>

      <p style={{ color: "red", marginTop: "20px" }}>{message}</p>
    </div>
  );
}