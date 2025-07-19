"use client";
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(Array.isArray(data) ? data : (data.products || []));
    setLoading(false);
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div style={{ minHeight: "100vh", background: "#FFF6F0", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "2.5rem 0" }}>
          <h2 className="search-title">Search Products</h2>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "1rem", marginBottom: "2.2rem" }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for products..."
              style={{
                fontSize: "1.15rem",
                padding: "0.7rem 1.2rem",
                borderRadius: "1.2rem",
                border: "1.5px solid #E67E22",
                background: "#fff",
                minWidth: "320px"
              }}
            />
            <button
              type="submit"
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                padding: "0.7rem 2.2rem",
                borderRadius: "1.2rem",
                border: "none",
                background: "linear-gradient(90deg, #E67E22 0%, #F4C542 100%)",
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 2px 8px 0 rgba(230,126,34,0.10)"
              }}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
          <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto" }}>
            {results.length === 0 && !loading && (
              <div style={{ textAlign: "center", color: "#888", fontSize: "1.15rem" }}>No products found.</div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem" }}>
              {results.map(prod => (
                <div key={prod.id} style={{
                  background: "#fff",
                  borderRadius: "1.2rem",
                  boxShadow: "0 2px 16px 0 #E67E2233",
                  border: "1.5px solid #E67E22",
                  padding: "1.2rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "260px",
                  position: "relative"
                }}>
                  <img
                    src={prod.image_url || "/fresh-food-logo.png"}
                    alt={prod.name || "Product"}
                    style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "1.2rem" }}
                    onError={e => { e.currentTarget.src = "/fresh-food-logo.png"; }}
                  />
                  <div style={{
                    fontWeight: 700,
                    fontSize: "1.08rem",
                    color: "#222",
                    textAlign: "center",
                    marginTop: "0.7rem"
                  }}>{prod.name}</div>
                  <div style={{
                    marginTop: "0.5rem",
                    borderRadius: "0.7rem",
                    background: "rgba(0,0,0,0.85)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "1.08rem",
                    padding: "0.35rem 1.1rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                    zIndex: 2
                  }}>${prod.price}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
        <style>{`
          .search-title {
            font-size: 2.3rem;
            font-weight: 900;
            letter-spacing: 1.5px;
            color: #2d2d2d;
            margin: 0 0 2.2rem 0;
            text-align: center;
            position: relative;
            padding-bottom: 0.4rem;
          }
          .search-title::after {
            content: "";
            display: block;
            width: 68px;
            height: 6px;
            border-radius: 3px;
            margin: 0.18rem auto 0 auto;
            background: linear-gradient(90deg, #E67E22 0%, #F4C542 100%);
            box-shadow: 0 2px 8px 0 rgba(230,126,34,0.10);
          }
        `}</style>
      </div>
    </GoogleOAuthProvider>
  );
}
