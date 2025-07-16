import React from "react";

export default function Hero() {
  return (
    <section style={{
      width: "100%",
      minHeight: "320px",
      background: "#FFF6F0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2.5rem 1rem 1.5rem 1rem"
    }}>
      <div style={{ fontSize: "3rem", fontWeight: 900, color: "#E67E22", marginBottom: "0.5rem" }}>
        <span role="img" aria-label="basket">🧺</span> FRESH FOOD
      </div>
      <div style={{ fontSize: "1.3rem", color: "#5C7D5C", fontWeight: 700, marginBottom: "1.2rem" }}>
        The Best For You
      </div>
      <input
        type="text"
        placeholder="Search for products..."
        style={{
          padding: "0.8rem 1.2rem",
          borderRadius: "2rem",
          border: "1px solid #E67E22",
          fontSize: "1rem",
          width: "min(90vw, 400px)",
          marginBottom: "1.2rem"
        }}
      />
      <button style={{
        background: "#E67E22",
        color: "#fff",
        fontWeight: 700,
        border: "none",
        borderRadius: "2rem",
        padding: "0.8rem 2.2rem",
        fontSize: "1.1rem",
        cursor: "pointer"
      }}>
        Shop Now
      </button>
    </section>
  );
}
