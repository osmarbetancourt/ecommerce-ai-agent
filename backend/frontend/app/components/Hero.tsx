import React from "react";

export default function Hero() {
  return (
    <section style={{ width: "100%", background: "#F6F8FA", padding: "2.5rem 0 2rem 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1 style={{ textAlign: "center", fontSize: "2.8rem", fontWeight: 900, color: "#222", marginBottom: "1.2rem" }}>
        Welcome
      </h1>
      <input
        type="text"
        placeholder="Search for products..."
        style={{
          padding: "1rem 1.5rem",
          borderRadius: "2rem",
          border: "1px solid #E67E22",
          fontSize: "1.2rem",
          width: "min(90vw, 600px)",
          marginBottom: "1.2rem",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
        }}
      />
    </section>
  );
}
