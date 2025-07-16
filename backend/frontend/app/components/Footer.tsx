import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        background: "#E67E22",
        color: "#fff",
        padding: "2.2rem 1rem 1.2rem 1rem",
        fontSize: "1.08rem",
        borderTop: "3px solid #F4C542",
        boxShadow: "0 -2px 16px 0 rgba(230,126,34,0.08)",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "2rem",
        flexWrap: "wrap",
        flexShrink: 0,
      }}
    >
      {/* Left: Brand & Copyright */}
      <div style={{ flex: 1, minWidth: 180, textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 900, fontSize: "1.5rem", color: "#fff", marginBottom: "0.7rem", letterSpacing: "0.04em" }}>
          FRESH FOOD
        </div>
        <div style={{ color: "#FFF6F0", marginBottom: "0.7rem", fontWeight: 500, fontSize: "0.98rem" }}>
          <span style={{ display: "block", marginBottom: "0.2rem" }}>&copy; 2025 Fresh Food Supermarket.</span>
          <span style={{ fontSize: "0.92rem", color: "#FFE5B4" }}>All rights reserved.</span>
        </div>
      </div>
      {/* Center: Quick Links & Contact */}
      <div style={{ flex: 1, minWidth: 220, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ marginBottom: "0.7rem", display: "flex", gap: "1.2rem", justifyContent: "center" }}>
          <a href="tel:+584121817101" style={{ color: "#F4C542", fontWeight: 700, textDecoration: "none", fontSize: "1.08rem" }} aria-label="Call Fresh Food">+58 412 181 7101</a>
          <span style={{ color: "#F4C542", fontWeight: 700, fontSize: "1.08rem" }}>|</span>
          <a href="mailto:info@freshfood.com" style={{ color: "#F4C542", fontWeight: 700, textDecoration: "none", fontSize: "1.08rem" }} aria-label="Email Fresh Food">info@freshfood.com</a>
        </div>
        <div style={{ marginBottom: "0.7rem", display: "flex", gap: "1.2rem", justifyContent: "center", fontSize: "0.98rem" }}>
          <a href="#" style={{ color: "#FFF6F0", textDecoration: "none", fontWeight: 500, fontSize: "0.98rem" }} aria-label="Privacy Policy">Privacy Policy</a>
          <span style={{ color: "#F4C542", fontWeight: 700, fontSize: "0.98rem" }}>|</span>
          <a href="#" style={{ color: "#FFF6F0", textDecoration: "none", fontWeight: 500, fontSize: "0.98rem" }} aria-label="Terms of Service">Terms of Service</a>
        </div>
        <div style={{ borderTop: "1px solid #F4C542", width: "60%", margin: "0.5rem auto 0.2rem auto" }}></div>
      </div>
      {/* Right: Social & Links */}
      <div style={{ flex: 1, minWidth: 180, textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{ marginBottom: "0.7rem", display: "flex", gap: "1.2rem", justifyContent: "flex-end" }}>
          {/* Instagram - Official logo, #FF0069 background, white logo */}
          <a href="#" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", background: '#E67E22', borderRadius: '50%', border: '2px solid #fff', width: 40, height: 40, justifyContent: 'center', transition: 'box-shadow 0.2s, transform 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = '0 0 0 4px #FF006944'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            aria-label="Instagram"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#FF0069" />
              <rect x="9" y="9" width="14" height="14" rx="4" stroke="#fff" strokeWidth="2" fill="none" />
              <circle cx="16" cy="16" r="4.5" stroke="#fff" strokeWidth="2" fill="none" />
              <circle cx="21" cy="11" r="1.2" fill="#fff" />
            </svg>
          </a>
          {/* Facebook - Official logo, inverted: blue background, white F */}
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", background: '#E67E22', borderRadius: '50%', border: '2px solid #fff', width: 40, height: 40, justifyContent: 'center', transition: 'box-shadow 0.2s, transform 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = '0 0 0 4px #0866FF44'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            aria-label="Facebook"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#0866FF" />
              <path d="M22.675 16H19V28H15V16H12.5V12.5H15V10.5C15 8.57 16.57 7 18.5 7H22V10.5H18.5V12.5H22.675L22 16Z" fill="#fff" />
            </svg>
          </a>
          {/* GitHub - Official Invertocat logo, #181717, no extra circle */}
          <a href="https://github.com/osmarbetancourt" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", background: '#E67E22', borderRadius: '50%', border: '2px solid #fff', width: 40, height: 40, justifyContent: 'center', transition: 'box-shadow 0.2s, transform 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = '0 0 0 4px #18171744'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            aria-label="GitHub"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.867 8.167 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.528 2.341 1.088 2.91.833.091-.646.35-1.088.636-1.339-2.221-.253-4.555-1.111-4.555-4.944 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 7.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.699 1.028 1.592 1.028 2.683 0 3.842-2.337 4.687-4.566 4.936.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.579.688.481C19.135 20.163 22 16.415 22 12c0-5.523-4.477-10-10-10z" fill="#181717"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
