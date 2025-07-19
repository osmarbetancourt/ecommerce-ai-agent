import React, { useEffect, useState, useRef } from "react";

const SLIDES_VISIBLE = 4;
const SLIDE_WIDTH = 220;

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const carouselRef1 = useRef<HTMLDivElement>(null);
  const carouselRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : (data.products || [])));
  }, []);

  // First carousel: left to right
  useEffect(() => {
    let animationFrame: number;
    let offset = 0;
    const speed = 0.25;
    function animate() {
      if (carouselRef1.current) {
        offset += speed;
        const totalWidth = (SLIDE_WIDTH + 12) * products.length;
        if (offset >= totalWidth) {
          offset = 0;
        }
        carouselRef1.current.style.transform = `translateX(-${offset}px)`;
      }
      animationFrame = requestAnimationFrame(animate);
    }
    if (products.length > SLIDES_VISIBLE) {
      animationFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [products]);

  // Second carousel: right to left
  useEffect(() => {
    let animationFrame: number;
    let offset = 0;
    const speed = 0.25;
    function animate() {
      if (carouselRef2.current) {
        offset += speed;
        const totalWidth = (SLIDE_WIDTH + 12) * products.length;
        if (offset >= totalWidth) {
          offset = 0;
        }
        carouselRef2.current.style.transform = `translateX(${offset}px)`;
      }
      animationFrame = requestAnimationFrame(animate);
    }
    if (products.length > SLIDES_VISIBLE) {
      animationFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [products]);

  return (
    <section id="products" style={{
      width: "100vw",
      background: "#FFF6F0",
      padding: "2.5rem 0 2.5rem 0",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      gap: "2.2rem"
    }}>
      <h2 className="products-title">Products</h2>
      {/* First carousel: left to right */}
      <div style={{
        width: "100vw",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div
          ref={carouselRef1}
          style={{
            display: "flex",
            gap: "0.75rem",
            transition: "transform 0.1s linear",
            willChange: "transform"
          }}
        >
          {products.map((prod, idx) => (
            <div key={prod.id || idx} style={{
              width: `${SLIDE_WIDTH}px`,
              height: "260px",
              background: "#fff",
              borderRadius: "1.2rem",
              boxShadow: "0 2px 16px 0 #E67E2233",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              border: "1.5px solid #E67E22",
              minWidth: `${SLIDE_WIDTH}px`,
              maxWidth: `${SLIDE_WIDTH}px`,
              overflow: "hidden"
            }}>
              <img
                src={prod.image_url || "/fresh-food-logo.png"}
                alt={prod.name || "Product"}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "1.2rem" }}
                onError={e => { e.currentTarget.src = "/fresh-food-logo.png"; }}
              />
              <div style={{
                position: "absolute",
                top: "0.7rem",
                left: 0,
                width: "100%",
                textAlign: "center",
                fontWeight: 700,
                fontSize: "1.08rem",
                color: "#222",
                textShadow: "0 2px 8px #fff, 0 1px 2px #fff",
                background: "rgba(255,255,255,0.12)",
                padding: "0.2rem 0"
              }}>{prod.name}</div>
              <div style={{
                position: "absolute",
                bottom: "1rem",
                left: "1rem",
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
      {/* Second carousel: right to left, random order */}
      <div style={{
        width: "100vw",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div
          ref={carouselRef2}
          style={{
            display: "flex",
            gap: "0.75rem",
            transition: "transform 0.1s linear",
            willChange: "transform"
          }}
        >
          {(() => {
            // Shuffle products array for random order
            const shuffled = [...products];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled.map((prod, idx) => (
              <div key={prod.id || idx} style={{
                width: `${SLIDE_WIDTH}px`,
                height: "260px",
                background: "#fff",
                borderRadius: "1.2rem",
                boxShadow: "0 2px 16px 0 #E67E2233",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                border: "1.5px solid #E67E22",
                minWidth: `${SLIDE_WIDTH}px`,
                maxWidth: `${SLIDE_WIDTH}px`,
                overflow: "hidden"
              }}>
                <img
                  src={prod.image_url || "/fresh-food-logo.png"}
                  alt={prod.name || "Product"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "1.2rem" }}
                  onError={e => { e.currentTarget.src = "/fresh-food-logo.png"; }}
                />
                <div style={{
                  position: "absolute",
                  top: "0.7rem",
                  left: 0,
                  width: "100%",
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: "1.08rem",
                  color: "#222",
                  textShadow: "0 2px 8px #fff, 0 1px 2px #fff",
                  background: "rgba(255,255,255,0.12)",
                  padding: "0.2rem 0"
                }}>{prod.name}</div>
                <div style={{
                  position: "absolute",
                  bottom: "1rem",
                  left: "1rem",
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
            ));
          })()}
        </div>
      </div>
      <style>{`
        .products-title {
          font-size: 2.7rem;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 0 0 2.5rem 0;
          text-align: center;
          position: relative;
          padding-bottom: 0.7rem;
          background: linear-gradient(90deg, #E67E22 0%, #F4C542 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          filter: drop-shadow(0 2px 8px rgba(230,126,34,0.10));
        }
        .products-title::after {
          content: "";
          display: block;
          margin: 0.5rem auto 0 auto;
          width: 160px;
          height: 14px;
          border-radius: 7px;
          background: linear-gradient(90deg, #E67E22 0%, #F4C542 100%);
          box-shadow: 0 6px 24px 0 rgba(230,126,34,0.15);
        }
      `}</style>
    </section>
  );
}
