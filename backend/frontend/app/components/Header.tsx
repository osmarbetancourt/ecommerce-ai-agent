import React from "react";

export default function Header() {
  return (
    <header style={{
      width: "100%",
      padding: "1.2rem 0.8rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "#FFF6F0",
      borderBottom: "1px solid #F4C542"
    }}>
      <div style={{ fontWeight: 900, fontSize: "2rem", color: "#E67E22" }}>
        FRESH FOOD
      </div>
      <nav style={{ display: "flex", gap: "1.2rem" }}>
        <a href="#shop" style={{ color: "#5C7D5C", fontWeight: 700 }}>Shop</a>
        <a href="#categories" style={{ color: "#5C7D5C", fontWeight: 700 }}>Categories</a>
        <a href="#offers" style={{ color: "#5C7D5C", fontWeight: 700 }}>Offers</a>
        <a href="#cart" style={{ color: "#E67E22", fontWeight: 700 }}>Cart</a>
      </nav>
    </header>
  );
}
