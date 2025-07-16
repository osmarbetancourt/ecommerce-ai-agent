import React from "react";

const products = [
  { name: "Apple", price: "$1.20", color: "#E67E22" },
  { name: "Banana", price: "$0.80", color: "#F4C542" },
  { name: "Milk", price: "$2.50", color: "#5C7D5C" },
  { name: "Bread", price: "$1.80", color: "#E67E22" },
  { name: "Chicken", price: "$5.00", color: "#5C7D5C" },
];

export default function Products() {
  return (
    <section id="products" style={{
      width: "100%",
      background: "#FFF6F0",
      padding: "1.2rem 0.5rem",
      display: "flex",
      overflowX: "auto",
      gap: "1.2rem"
    }}>
      {products.map(prod => (
        <div key={prod.name} style={{
          minWidth: "140px",
          background: "#fff",
          borderRadius: "1.2rem",
          padding: "1.2rem 0.8rem",
          textAlign: "center",
          fontWeight: 700,
          fontSize: "1.1rem",
          boxShadow: `0 2px 8px 0 ${prod.color}33`,
          border: `2px solid ${prod.color}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <div style={{ fontSize: "2.2rem", marginBottom: "0.5rem", color: prod.color }}>🍏</div>
          {prod.name}
          <div style={{ fontWeight: 400, fontSize: "1rem", color: prod.color, marginTop: "0.5rem" }}>{prod.price}</div>
          <button style={{
            background: prod.color,
            color: "#fff",
            fontWeight: 700,
            border: "none",
            borderRadius: "1rem",
            padding: "0.5rem 1.2rem",
            fontSize: "0.95rem",
            marginTop: "0.7rem",
            cursor: "pointer"
          }}>
            Add to Cart
          </button>
        </div>
      ))}
    </section>
  );
}
