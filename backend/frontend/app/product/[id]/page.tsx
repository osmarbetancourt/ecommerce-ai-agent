"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useParams } from "next/navigation";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [addStatus, setAddStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      setProduct(data);
      setLoading(false);
    }
    if (id) fetchProduct();
    // No need to check for JWT here, handled by AuthProvider
  }, [id]);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div style={{ minHeight: "100vh", background: "#FFF6F0", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "2.5rem 0" }}>
          {loading ? (
            <div style={{ fontSize: "1.3rem", color: "#E67E22", marginTop: "3rem" }}>Loading...</div>
          ) : product ? (
            <div style={{
              background: "#fff",
              borderRadius: "1.2rem",
              boxShadow: "0 2px 16px 0 #E67E2233",
              border: "1.5px solid #E67E22",
              padding: "2.2rem",
              maxWidth: 600,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              margin: "0 auto"
            }}>
              <img
                src={product.image_url || "/fresh-food-logo.png"}
                alt={product.name || "Product"}
                style={{ width: "100%", maxWidth: 340, height: 240, objectFit: "cover", borderRadius: "1.2rem" }}
                onError={e => { e.currentTarget.src = "/fresh-food-logo.png"; }}
              />
              <h1 style={{ fontWeight: 900, fontSize: "2.1rem", color: "#222", marginTop: "1.2rem", textAlign: "center" }}>{product.name}</h1>
              <div style={{
                marginTop: "0.7rem",
                borderRadius: "0.7rem",
                background: "rgba(0,0,0,0.85)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.25rem",
                padding: "0.45rem 1.3rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                zIndex: 2
              }}>${product.price}</div>
              <div style={{ marginTop: "1.2rem", color: "#444", fontSize: "1.08rem", textAlign: "center" }}>{product.description}</div>
              <button
                style={{
                  marginTop: "2rem",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  padding: "0.7rem 2.2rem",
                  borderRadius: "1.2rem",
                  border: "none",
                  background: user ? "linear-gradient(90deg, #E67E22 0%, #F4C542 100%)" : "#ccc",
                  color: "#fff",
                  cursor: user ? "pointer" : "not-allowed",
                  boxShadow: "0 2px 8px 0 rgba(230,126,34,0.10)"
                }}
                disabled={!user}
                onClick={async () => {
                  if (!user) {
                    alert("Please sign in to add to cart.");
                    setAddStatus("Please sign in to add to cart.");
                    return;
                  }
                  setAddStatus(null);
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
                      body: JSON.stringify({ cart_id: cartData.id, product_id: product.id, quantity: 1 })
                    });
                    if (!res.ok) throw new Error("Failed to add to cart");
                    setAddStatus("Added to cart!");
                  } catch (err) {
                    setAddStatus("Error adding to cart.");
                  }
                }}
              >{user ? "Add to Cart" : "Sign in to Add"}</button>
              {addStatus && <div style={{ marginTop: "1rem", color: addStatus === "Added to cart!" ? "green" : "red", fontWeight: 700 }}>{addStatus}</div>}
            </div>
          ) : (
            <div style={{ fontSize: "1.15rem", color: "#888", marginTop: "3rem" }}>Product not found.</div>
          )}
        </main>
        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
}
