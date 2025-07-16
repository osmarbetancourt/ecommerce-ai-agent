import React from "react";
import { RefObject } from "react";

type HeaderProps = { audioRef?: RefObject<HTMLAudioElement | null> };
export default function Header({ audioRef }: HeaderProps) {
  return (
    <header
      style={{
        width: "100%",
        background: "#E67E22",
        color: "#fff",
        padding: "1.4rem 1.2rem 1.1rem 1.2rem",
        fontSize: "1.08rem",
        borderBottom: "3px solid #F4C542",
        boxShadow: "0 2px 16px 0 rgba(230,126,34,0.08)",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "2rem",
        flexWrap: "wrap",
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 64 }}>
        <img
          src="/fresh-food-logo.png"
          alt="Fresh Food Logo"
          style={{
            height: 64,
            width: 'auto',
            maxWidth: 200,
            borderRadius: 14,
            boxShadow: '0 2px 8px rgba(230,126,34,0.10)',
            objectFit: 'contain',
            background: 'transparent',
          }}
        />
        <button
          id="magic-btn"
          style={{
            marginTop: 2,
            fontSize: '0.78rem',
            color: '#F4C542',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: 500,
            opacity: 0.5,
            transition: 'opacity 0.2s',
            textDecoration: 'underline',
            outline: 'none',
            letterSpacing: '0.01em',
          }}
          aria-label="Try the magic!"
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
          onClick={() => {
            // Play audio directly on button click for browser gesture
            if (audioRef && audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
            }
            if (window && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('trigger-magic-splash'));
            }
          }}
        >
          Try the magic!
        </button>
      </div>
      <nav style={{ display: "flex", gap: "1.2rem", fontFamily: 'Inter, sans-serif' }}>
        <a href="#shop" style={{ color: "#F4C542", fontWeight: 700, textDecoration: "none", fontSize: "1.08rem", transition: "color 0.2s" }} aria-label="Shop"
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#F4C542'}
        >Shop</a>
        <a href="#categories" style={{ color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "1.08rem", transition: "color 0.2s" }} aria-label="Categories"
          onMouseEnter={e => e.currentTarget.style.color = '#F4C542'}
          onMouseLeave={e => e.currentTarget.style.color = '#fff'}
        >Categories</a>
        <a href="#offers" style={{ color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "1.08rem", transition: "color 0.2s" }} aria-label="Offers"
          onMouseEnter={e => e.currentTarget.style.color = '#F4C542'}
          onMouseLeave={e => e.currentTarget.style.color = '#fff'}
        >Offers</a>
        <a href="#cart" style={{ color: "#F4C542", fontWeight: 700, textDecoration: "none", fontSize: "1.08rem", transition: "color 0.2s" }} aria-label="Cart"
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#F4C542'}
        >Cart</a>
      </nav>
    </header>
  );
}
