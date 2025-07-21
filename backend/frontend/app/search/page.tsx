"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [addStatus, setAddStatus] = useState<{ [key: number]: string }>({});

  // Read query from URL and auto-search on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get("query") || "";
      const urlCategory = params.get("category") || "";
      if (urlQuery || urlCategory) {
        setQuery(urlQuery);
        setCategory(urlCategory);
        search(urlQuery, urlCategory);
      }
      // No need to check for JWT here, handled by AuthProvider
    }
    // eslint-disable-next-line
  }, []);

  const [category, setCategory] = useState("");

  async function search(q: string, cat?: string) {
    setLoading(true);
    let apiUrl = `/api/products?`;
    if (q) apiUrl += `search=${encodeURIComponent(q)}&`;
    if (cat) apiUrl += `category=${encodeURIComponent(cat)}&`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    setResults(Array.isArray(data) ? data : (data.products || []));
    setLoading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    search(query, category);
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div style={{ minHeight: "100vh", background: "#FFF6F0", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "2.5rem 0" }}>
          <h2 className="search-title">Search Products</h2>
          {category && (
            <div style={{ textAlign: "center", color: "#E67E22", fontWeight: 700, fontSize: "1.08rem", marginBottom: "1.2rem" }}>
              Category: {category}
            </div>
          )}
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="search-input"
            />
            <button
              type="submit"
              className="search-btn"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
          <div className="search-results-grid">
            {results.length === 0 && !loading && (
              <div className="no-products">No products found.</div>
            )}
            <div className="results-grid">
              {results.map(prod => (
                <div key={prod.id} className="product-card">
                  <Link href={`/product/${prod.id}`} style={{ textDecoration: "none" }}>
                    <div className="product-card-inner">
                      <img
                        src={prod.image_url || "/fresh-food-logo.png"}
                        alt={prod.name || "Product"}
                        className="product-image"
                        onError={e => { e.currentTarget.src = "/fresh-food-logo.png"; }}
                      />
                      <div className="product-name">{prod.name}</div>
                      <div className="product-price">${prod.price}</div>
                    </div>
                  </Link>
                  <button
                    className="add-to-cart-btn"
                    disabled={!user}
                    onClick={async () => {
                      if (!user) {
                        alert("Please sign in to add to cart.");
                        setAddStatus(s => ({ ...s, [prod.id]: "Please sign in to add to cart." }));
                        return;
                      }
                      setAddStatus(s => ({ ...s, [prod.id]: "" }));
                      try {
                        // Fetch user's cart id
                        const cartRes = await fetch("/api/carts/me", { credentials: "include" });
                        const cartData = await cartRes.json();
                        // Add product to cart
                        const res = await fetch("/api/cart-items", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json"
                          },
                          credentials: "include",
                          body: JSON.stringify({ cart_id: cartData.id, product_id: prod.id, quantity: 1 })
                        });
                        if (!res.ok) throw new Error("Failed to add to cart");
                        setAddStatus(s => ({ ...s, [prod.id]: "Added to cart!" }));
                      } catch (err) {
                        setAddStatus(s => ({ ...s, [prod.id]: "Error adding to cart." }));
                      }
                    }}
                  >{user ? "Add to Cart" : "Sign in to Add"}</button>
                  {addStatus[prod.id] && <div className="add-status" style={{ marginTop: "0.3rem", color: addStatus[prod.id] === "Added to cart!" ? "green" : "red", fontWeight: 700 }}>{addStatus[prod.id]}</div>}
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
          .search-form {
            display: flex;
            gap: 1rem;
            margin-bottom: 2.2rem;
            width: 100%;
            max-width: 600px;
            padding: 0 1rem;
          }
          .search-input {
            font-size: 1.15rem;
            padding: 0.7rem 1.2rem;
            border-radius: 1.2rem;
            border: 1.5px solid #E67E22;
            background: #fff;
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
          }
          .search-btn {
            font-size: 1.15rem;
            font-weight: 700;
            padding: 0.7rem 2.2rem;
            border-radius: 1.2rem;
            border: none;
            background: linear-gradient(90deg, #E67E22 0%, #F4C542 100%);
            color: #fff;
            cursor: pointer;
            box-shadow: 0 2px 8px 0 rgba(230,126,34,0.10);
            transition: background 0.2s, box-shadow 0.2s, color 0.2s;
          }
          .search-btn:disabled {
            background: #ccc;
            color: #fff;
            cursor: not-allowed;
          }
          .search-results-grid {
            width: 100%;
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          .no-products {
            text-align: center;
            color: #888;
            font-size: 1.15rem;
          }
          .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 2rem;
          }
          .product-card {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            min-width: 0;
          }
          .product-card-inner {
            background: #fff;
            border-radius: 1.2rem;
            box-shadow: 0 2px 16px 0 #E67E2233;
            border: 1.5px solid #E67E22;
            padding: 1.2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 260px;
            position: relative;
            transition: box-shadow 0.2s, transform 0.2s;
            width: 100%;
          }
          .product-card-inner:hover {
            box-shadow: 0 4px 24px 0 #E67E2266;
            transform: scale(1.03);
          }
          .product-image {
            width: 100%;
            height: 160px;
            object-fit: cover;
            border-radius: 1.2rem;
          }
          .product-name {
            font-weight: 700;
            font-size: 1.08rem;
            color: #222;
            text-align: center;
            margin-top: 0.7rem;
          }
          .product-price {
            margin-top: 0.5rem;
            border-radius: 0.7rem;
            background: rgba(0,0,0,0.85);
            color: #fff;
            font-weight: 700;
            font-size: 1.08rem;
            padding: 0.35rem 1.1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
            z-index: 2;
          }
          .add-to-cart-btn {
            margin-top: 0.7rem;
            font-size: 1rem;
            font-weight: 700;
            padding: 0.5rem 1.2rem;
            border-radius: 1.1rem;
            border: none;
            background: linear-gradient(90deg, #E67E22 0%, #F4C542 100%);
            color: #fff;
            cursor: pointer;
            box-shadow: 0 2px 8px 0 rgba(230,126,34,0.10);
            width: 100%;
            transition: background 0.2s, box-shadow 0.2s, color 0.2s;
          }
          .add-to-cart-btn:disabled {
            background: #ccc;
            color: #fff;
            cursor: not-allowed;
          }
          .add-status {
            margin-top: 0.3rem;
            font-weight: 700;
          }
          @media (max-width: 900px) {
            .results-grid {
              gap: 1.2rem;
            }
            .search-results-grid {
              padding: 0 0.5rem;
            }
            .search-form {
              max-width: 100vw;
              padding: 0 0.5rem;
            }
          }
          @media (max-width: 600px) {
            .results-grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }
            .product-card-inner {
              min-height: 180px;
              padding: 0.7rem;
            }
            .product-image {
              height: 110px;
            }
            .search-title {
              font-size: 1.5rem;
            }
            .search-form {
              flex-direction: column;
              gap: 0.7rem;
              padding: 0 0.2rem;
            }
          }
        `}</style>
      </div>
    </GoogleOAuthProvider>
  );
}
