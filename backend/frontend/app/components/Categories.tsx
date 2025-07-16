import React from "react";

const categories = [
  { name: "Fruits", color: "#E67E22" },
  { name: "Vegetables", color: "#5C7D5C" },
  { name: "Dairy", color: "#F4C542" },
  { name: "Bakery", color: "#E67E22" },
  { name: "Meat", color: "#5C7D5C" },
];

export default function Categories() {
  return (
    <section id="categories" style={{
      width: "100%",
      background: "#FFF6F0",
      padding: "1.2rem 0.5rem",
      display: "flex",
      overflowX: "auto",
      gap: "1.2rem"
    }}>
      {categories.map(cat => (
        <div key={cat.name} style={{
          minWidth: "110px",
          background: cat.color,
          color: "#fff",
          borderRadius: "1.2rem",
          padding: "1.2rem 0.8rem",
          textAlign: "center",
          fontWeight: 700,
          fontSize: "1.1rem",
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)"
        }}>
          {cat.name}
        </div>
      ))}
    </section>
  );
}
