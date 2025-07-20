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
  const [products, setProducts] = useState<Record<number, any>>({});
  const [total, setTotal] = useState<number>(0);

  const { user } = useAuth();
  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch("/api/carts/me", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCart(data);
        // Fetch product details for each cart item
        if (data.items && data.items.length > 0) {
          const productIds: number[] = Array.from(new Set(data.items.map((item: CartItem) => item.product_id)));
          const productMap: Record<number, any> = {};
          let sum = 0;
          await Promise.all(productIds.map(async (pid) => {
            const pres = await fetch(`/api/products/${pid}`);
            if (pres.ok) {
              const pdata = await pres.json();
              productMap[pid] = pdata;
            }
          }));
          // Calculate total
          data.items.forEach((item: CartItem) => {
            const prod = productMap[item.product_id];
            if (prod) sum += prod.price * item.quantity;
          });
          setProducts(productMap);
          setTotal(sum);
        } else {
          setProducts({});
          setTotal(0);
        }
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

  const handleCheckout = async () => {
    if (!cart || !cart.items || cart.items.length === 0) return;
    try {
      // Delete all cart items for this cart
      await Promise.all(
        cart.items.map(async (item) => {
          await fetch(`/api/cart-items/${item.id}`, {
            method: "DELETE",
            credentials: "include",
          });
        })
      );
      // Refetch cart to update UI
      setError(null);
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500)); // slight delay for backend
      const res = await fetch("/api/carts/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cart after checkout");
      const data = await res.json();
      setCart(data);
      setProducts({});
      setTotal(0);
    } catch (err) {
      setError("Failed to reset cart after checkout.");
    } finally {
      setLoading(false);
    }
  };

  // Group cart items by product_id and sum quantities
  let groupedItems: { product_id: number; quantity: number; ids: number[] }[] = [];
  if (cart && cart.items && cart.items.length > 0) {
    const groupMap: Record<number, { quantity: number; ids: number[] }> = {};
    cart.items.forEach((item) => {
      if (!groupMap[item.product_id]) {
        groupMap[item.product_id] = { quantity: 0, ids: [] };
      }
      groupMap[item.product_id].quantity += item.quantity;
      groupMap[item.product_id].ids.push(item.id);
    });
    groupedItems = Object.entries(groupMap).map(([product_id, { quantity, ids }]) => ({ product_id: Number(product_id), quantity, ids }));
  }

  // Add/Remove item handlers
  const handleAddItem = async (product_id: number) => {
    setLoading(true);
    setError(null);
    try {
      await fetch(`/api/cart-items`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id, quantity: 1 }),
      });
      // Refetch cart
      const res = await fetch("/api/carts/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cart after add");
      const data = await res.json();
      setCart(data);
    } catch (err) {
      setError("Failed to add item.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (group: { product_id: number; quantity: number; ids: number[] }) => {
    setLoading(true);
    setError(null);
    try {
      if (group.quantity <= 1) {
        // Remove all items for this product
        await Promise.all(
          group.ids.map(async (id) => {
            await fetch(`/api/cart-items/${id}`, {
              method: "DELETE",
              credentials: "include",
            });
          })
        );
      } else {
        // Remove one item (assume each id is a single quantity)
        await fetch(`/api/cart-items/${group.ids[0]}`, {
          method: "DELETE",
          credentials: "include",
        });
      }
      // Refetch cart
      const res = await fetch("/api/carts/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cart after remove");
      const data = await res.json();
      setCart(data);
    } catch (err) {
      setError("Failed to remove item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1, padding: "2rem" }}>
          <h1>Your Cart</h1>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {groupedItems.length > 0 ? (
            <>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {groupedItems.map((group) => {
                  const prod = products[group.product_id];
                  return (
                    <li key={group.product_id} style={{ marginBottom: "1.5rem", background: "#fff6e0", borderRadius: "1rem", padding: "1rem", boxShadow: "0 2px 8px #E67E2233" }}>
                      {prod ? (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img src={prod.image_url || "/fresh-food-logo.png"} alt={prod.name} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "0.7rem", marginRight: "1.2rem" }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: "1.15rem" }}>{prod.name}</div>
                            <div style={{ color: "#444" }}>{prod.description}</div>
                            <div style={{ color: "#E67E22", fontWeight: 700 }}>${prod.price} x {group.quantity}</div>
                            <div style={{ marginTop: "0.7rem", display: "flex", gap: "0.7rem" }}>
                              <button onClick={() => handleRemoveItem(group)} disabled={loading} style={{ padding: "0.3rem 1rem", fontSize: "1.1rem", borderRadius: "0.7rem", border: "none", background: "#E67E22", color: "#fff", cursor: "pointer" }}>−</button>
                              <button onClick={() => handleAddItem(group.product_id)} disabled={loading} style={{ padding: "0.3rem 1rem", fontSize: "1.1rem", borderRadius: "0.7rem", border: "none", background: "#27ae60", color: "#fff", cursor: "pointer" }}>+</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>Product ID: {group.product_id} | Quantity: {group.quantity}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div style={{ fontWeight: 900, fontSize: "1.3rem", marginTop: "2rem" }}>Total: ${total.toFixed(2)}</div>
              <button onClick={handleCheckout} style={{ marginTop: "2rem", padding: "0.8rem 2.5rem", fontSize: "1.15rem", fontWeight: 700, borderRadius: "1.2rem", border: "none", background: "linear-gradient(90deg, #E67E22 0%, #F4C542 100%)", color: "#fff", cursor: "pointer", boxShadow: "0 2px 8px 0 rgba(230,126,34,0.10)" }}>
                Pay
              </button>
            </>
          ) : (
            !loading && <p>Your cart is empty.</p>
          )}
        </main>
        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
}
