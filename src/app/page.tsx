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

      const data = await res.json().catch(() => null);

      if (data?.success) {
        window.location.href = "/calendar";
      } else {
        setMessage(data?.error || "Incorrect password.");
      }
    } catch {
      setMessage("Connection error.");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#120804",
        color: "#f5e7c8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "#1b0d06",
          border: "1px solid #9c6f12",
          borderRadius: "32px",
          padding: "48px 32px",
          textAlign: "center",
          boxShadow: "0 0 40px rgba(0,0,0,0.35)",
        }}
      >
        <img
          src="/logo.png"
          alt="ASSASSINS GUILD"
          style={{
            width: "140px",
            height: "140px",
            objectFit: "contain",
            margin: "0 auto 24px",
            display: "block",
          }}
        />

        <div
          style={{
            letterSpacing: "0.28em",
            color: "#c99a27",
            fontSize: "18px",
            marginBottom: "20px",
          }}
        >
          ASSASSINS GUILD
        </div>

        <h1
          style={{
            fontSize: "72px",
            lineHeight: 1.05,
            margin: "0 0 24px",
            fontWeight: 700,
          }}
        >
          Guild Carriage Reservation
        </h1>

        <p
          style={{
            fontSize: "20px",
            margin: "0 0 12px",
            color: "#f0d39a",
          }}
        >
          Manage carriage duty assignments for guild members.
        </p>

        <p
          style={{
            fontSize: "18px",
            margin: "0 0 40px",
            color: "#c99a27",
          }}
        >
          Authorized members only
        </p>

        <div
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#f0c14b",
            marginBottom: "18px",
          }}
        >
          Enter Guild Password
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
          style={{
            width: "100%",
            maxWidth: "520px",
            height: "78px",
            borderRadius: "20px",
            border: "2px solid #c99a27",
            background: "#000",
            color: "#f5e7c8",
            fontSize: "28px",
            textAlign: "center",
            outline: "none",
            marginBottom: "18px",
            padding: "0 20px",
          }}
        />

        <br />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            maxWidth: "520px",
            height: "84px",
            borderRadius: "22px",
            border: "none",
            background: "linear-gradient(180deg, #dcb45b, #be8e2f)",
            color: "#111",
            fontSize: "34px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Enter
        </button>

        {message && (
          <p
            style={{
              marginTop: "28px",
              color: "#ff8f8f",
              fontSize: "18px",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}