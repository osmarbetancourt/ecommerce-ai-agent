"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";

type CartItem = {
  id: number;
  product_id: number;
  quantity: number;
};

type Cart = {
  id: number;
  user_id: number;
  items: CartItem[];
};
import Header from "../components/Header";
import Footer from "../components/Footer";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  useEffect(() => {
    async function fetchCart() {
      try {
        if (!user) {
          setError("Please sign in to view your cart.");
          setLoading(false);
          return;
        }
        // Use JWT or user.id for authentication if needed
        const res = await fetch("/api/carts/me", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCart(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, [user]);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1, padding: "2rem" }}>
          <h1>Your Cart</h1>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {cart && cart.items && cart.items.length > 0 ? (
            <ul>
              {cart.items.map((item) => (
                <li key={item.id}>
                  Product ID: {item.product_id} | Quantity: {item.quantity}
                </li>
              ))}
            </ul>
          ) : (
            !loading && <p>Your cart is empty.</p>
          )}
        </main>
        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
}
