import React, { useState, useEffect } from "react";
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { RefObject } from "react";

type HeaderProps = { audioRef?: RefObject<HTMLAudioElement | null> };

export default function Header({ audioRef }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      return window.location.hash.replace('#', '');
    }
    return "shop";
  });
  // User state
  const [user, setUser] = useState<any>(null);
  const cartItems = 0; // Replace with actual cart items count
  const cartCount = user && cartItems > 0 ? cartItems : 0;

  useEffect(() => {
    const onHashChange = () => {
      setActiveSection(window.location.hash.replace('#', ''));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return (
    <header
      style={{
        width: "100%",
        background: "linear-gradient(105deg, #d35400 0%, #E67E22 60%, #F4C542 90%, #fffbe9 100%)",
        color: "#fff",
        padding: "1.4rem 0 1.1rem 0",
        fontSize: "1.08rem",
        borderBottom: "3px solid #F4C542",
        boxShadow: "0 2px 16px 0 rgba(230,126,34,0.12)",
        display: "block",
        flexShrink: 0,
      }}
    >
      <div style={{
        margin: "0 auto",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        width: "100%",
        padding: "0 1.5rem",
        position: "relative",
      }}>
        {/* Responsive styles and mobile menu */}
        <style>{`
          @media (max-width: 600px) {
            .nav-desktop {
              display: none !important;
            }
            .menu-btn {
              display: flex !important;
            }
            .mobile-nav {
              display: block !important;
            }
            .header-main-row {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 0.5rem !important;
            }
            .header-logo-col {
              flex-direction: column !important;
              align-items: center !important;
              min-width: 0 !important;
              width: 100% !important;
              gap: 0.2rem !important;
            }
            .header-search-form {
              min-width: 0 !important;
              max-width: 100vw !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              width: 100% !important;
              margin-top: 0.5rem !important;
              backdrop-filter: blur(4px);
              background: rgba(255,251,233,0.85);
              border-radius: 18px !important;
              box-shadow: 0 2px 16px 0 rgba(230,126,34,0.10);
              border: 1.5px solid #f4c54244;
              padding: 0.15rem 0.2rem;
            }
            .header-search-input {
              font-size: 1.05rem !important;
              padding: 0.7rem 2.2rem 0.7rem 1.1rem !important;
              border-radius: 14px !important;
              border: 1.5px solid #f4c54288 !important;
              background: rgba(255,251,233,0.95) !important;
              box-shadow: 0 2px 8px rgba(230,126,34,0.08);
              transition: border 0.2s, box-shadow 0.2s, background 0.2s;
            }
            .header-search-input:focus {
              border: 2px solid #E67E22 !important;
              background: #fffbe9 !important;
              box-shadow: 0 2px 16px 0 #E67E2244;
            }
          }
          @keyframes magicGlow {
            0% {
              box-shadow: 0 0 0px 0px #F4C542;
            }
            50% {
              box-shadow: 0 0 12px 4px #F4C54244;
            }
            100% {
              box-shadow: 0 0 0px 0px #F4C542;
            }
          }
          .menu-btn {
            display: none;
            background: none;
            border: none;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            margin-left: 12px;
          }
          #magic-btn {
            animation: magicGlow 2.2s ease-in-out infinite;
          }
          .mobile-nav {
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            background: #E67E22;
            border-radius: 0 0 12px 12px;
            box-shadow: 0 4px 16px rgba(230,126,34,0.10);
            z-index: 10;
            min-width: 180px;
            padding: 1rem 0.5rem;
            border-top: 3px solid #F4C542;
          }
          .mobile-nav a {
            display: block;
            padding: 0.7rem 1rem;
            color: #fff;
            font-weight: 700;
            text-decoration: none;
            font-size: 1.08rem;
            border-radius: 6px;
            margin-bottom: 0.2rem;
            transition: background 0.2s, color 0.2s;
            border-bottom: 1px solid #F4C542;
          }
          .mobile-nav a.active {
            background: #F8B23C;
            color: #fff;
            font-weight: 900;
            box-shadow: 0 2px 8px rgba(226,102,9,0.10);
            text-shadow: none;
            border-bottom: 2px solid #FFF5E1;
          }
          .nav-desktop a.active {
            background: #F8B23C;
            color: #fff;
            font-weight: 900;
            border-radius: 6px;
            box-shadow: 0 2px 12px 0 #F8B23C55;
            padding: 0.7rem 1rem;
            border-bottom: 2px solid #FFF5E1;
            text-shadow: none;
            outline: 2px solid #FFF5E1;
          }
          .mobile-nav a:last-child {
            border-bottom: none;
          }
          .mobile-nav a:hover {
            background: #FFF5E1;
            color: #E26609;
            text-decoration: underline;
            box-shadow: 0 2px 12px #F8B23C44;
            text-shadow: none;
            font-weight: 900;
            transition: background 0.2s, color 0.2s, box-shadow 0.2s, text-decoration 0.2s;
          }
          .nav-desktop a {
            transition: background 0.2s, color 0.2s, box-shadow 0.2s, text-decoration 0.2s, border-bottom 0.2s;
            padding: 0.7rem 1rem;
            border-radius: 6px;
            color: #fff;
            background: #F8B23C;
            font-weight: 900;
            text-decoration: none;
            font-size: 1.08rem;
            box-shadow: 0 1px 6px #FFF5E144;
            text-shadow: none;
          }
          .nav-desktop a:hover {
            background: #FFF5E1;
            color: #E26609;
            text-decoration: underline;
            box-shadow: 0 2px 12px #F8B23C44;
            text-shadow: none;
            font-weight: 900;
            border-bottom: 2px solid #F8B23C;
          }
        `}</style>
        <div className="header-main-row" style={{
          margin: "0 auto",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          width: "100%",
          padding: "0 1.5rem",
          position: "relative",
        }}>
          <div className="header-logo-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 200 }}>
            <a href="#home" aria-label="Home">
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
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
              />
            </a>
            <button
              id="magic-btn"
              style={{
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
                marginTop: 8,
                alignSelf: 'flex-start',
                marginLeft: 0,
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
          {/* Search bar */}
            <form role="search" aria-label="Site search" className="header-search-form" style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: 340, minWidth: 180, marginLeft: 24, marginRight: 12, position: 'relative', borderRadius: 18, boxShadow: '0 2px 16px 0 rgba(230,126,34,0.10)', background: 'rgba(255,251,233,0.85)', border: '1.5px solid #f4c54244', padding: '0.15rem 0.2rem', backdropFilter: 'blur(4px)' }}>
            <input
              type="search"
              placeholder="Search..."
              aria-label="Search products"
              className="header-search-input"
              style={{
                width: '100%',
                padding: '0.7rem 2.2rem 0.7rem 1.1rem',
                borderRadius: 14,
                border: '1.5px solid #f4c54288',
                fontSize: '1.05rem',
                fontFamily: 'Inter, Arial, sans-serif',
                background: 'rgba(255,251,233,0.95)',
                color: '#E67E22',
                fontWeight: 500,
                outline: 'none',
                boxShadow: '0 2px 8px rgba(230,126,34,0.08)',
                transition: 'border 0.2s, box-shadow 0.2s, background 0.2s',
              }}
            />
            <button type="submit" aria-label="Search" style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
                <circle cx="9" cy="9" r="7" stroke="#E67E22" strokeWidth="2" />
                <line x1="15" y1="15" x2="19" y2="19" stroke="#E67E22" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </form>
          {/* Desktop navigation */}
          <nav className="nav-desktop" style={{ display: "flex", gap: "1.2rem", fontFamily: 'Inter, sans-serif', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
            <a
              href="#shop"
              className={activeSection === "shop" ? "active" : ""}
              aria-label="Shop"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                Shop
              </span>
            </a>
            <a
              href="#categories"
              className={activeSection === "categories" ? "active" : ""}
              aria-label="Categories"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                Categories
              </span>
            </a>
            <a
              href="#offers"
              className={activeSection === "offers" ? "active" : ""}
              aria-label="Offers"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                Offers
              </span>
            </a>
            {/* User/Login button/icon */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginLeft: 12 }}>
              {user ? (
                <>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', marginRight: 4 }}>{user.name || user.email}</span>
                  <button aria-label="Logout" style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '1.05rem',
                    padding: '0.2rem 0.7rem',
                    borderRadius: 8,
                    transition: 'background 0.2s',
                  }}
                    onClick={() => {
                      googleLogout();
                      setUser(null);
                    }}
                  >Logout</button>
                </>
              ) : (
                <GoogleLogin
                  onSuccess={credentialResponse => {
                    // You can send credentialResponse.credential to your backend for verification
                    // For demo, decode basic info
                    const base64Url = credentialResponse.credential?.split('.')[1];
                    if (base64Url) {
                      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                      }).join(''));
                      setUser(JSON.parse(jsonPayload));
                    }
                  }}
                  onError={() => {
                    alert('Google Login Failed');
                  }}
                  width={180}
                />
              )}
            </span>
            <a
              href="#cart"
              className={activeSection === "cart" ? "active" : ""}
              aria-label="Cart"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
                {/* Cart Icon - SVG from svgrepo.com, standard orientation, no transforms */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" fill="none" aria-hidden="true" focusable="false" style={{ marginRight: 4 }}>
                  <path fill="#fff" d="M10.5 27.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm15 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6.7 7.5l2.2 11h14.6l2.2-11H6.7Zm20.8-2a1 1 0 0 1 1 .8l2.5 12.5a1 1 0 0 1-1 1.2H7.5l.5 2.5h17a1 1 0 1 1 0 2h-17a1 1 0 0 1-1-.8l-3-15A1 1 0 0 1 5.5 5h22Z"/>
                </svg>
                {/* Cart badge */}
                {cartCount > 0 && (
                  <span
                    aria-label={`Cart has ${cartCount} items`}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -12,
                      minWidth: 18,
                      height: 18,
                      background: '#E26609',
                      color: '#fff',
                      borderRadius: '50%',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 4px #E2660944',
                      padding: '0 5px',
                      zIndex: 1,
                      border: '2px solid #fff',
                    }}
                  >{cartCount}</span>
                )}
              </span>
            </a>
          </nav>
          {/* Mobile hamburger button */}
          <button
            className="menu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(open => !open)}
          >
            {/* Hamburger icon */}
            <span style={{ display: 'block', width: 28, height: 28, position: 'relative' }}>
              <span style={{
                position: 'absolute',
                top: 8,
                left: 4,
                width: 20,
                height: 3,
                background: '#fff',
                borderRadius: 2,
                transition: 'transform 0.2s',
                transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none',
              }} />
              <span style={{
                position: 'absolute',
                top: 14,
                left: 4,
                width: 20,
                height: 3,
                background: '#fff',
                borderRadius: 2,
                opacity: menuOpen ? 0 : 1,
                transition: 'opacity 0.2s',
              }} />
              <span style={{
                position: 'absolute',
                top: 20,
                left: 4,
                width: 20,
                height: 3,
                background: '#fff',
                borderRadius: 2,
                transition: 'transform 0.2s',
                transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
              }} />
            </span>
          </button>
          {/* Mobile dropdown menu */}
          {menuOpen && (
            <div className="mobile-nav">
              <a
                href="#shop"
                className={activeSection === "shop" ? "active" : ""}
                aria-label="Shop"
                onClick={() => setMenuOpen(false)}
              >Shop</a>
              <a
                href="#categories"
                className={activeSection === "categories" ? "active" : ""}
                aria-label="Categories"
                onClick={() => setMenuOpen(false)}
              >Categories</a>
              <a
                href="#offers"
                className={activeSection === "offers" ? "active" : ""}
                aria-label="Offers"
                onClick={() => setMenuOpen(false)}
              >Offers</a>
              <a
                href="#cart"
                className={activeSection === "cart" ? "active" : ""}
                aria-label="Cart"
                onClick={() => setMenuOpen(false)}
              >Cart</a>
              {/* User/Login button/icon for mobile - styled intentionally different for visibility */}
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                {user ? (
                  <>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', marginRight: 4 }}>{user.name || user.email}</span>
                    <button aria-label="Logout" style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '1.05rem',
                      padding: '0.2rem 0.7rem',
                      borderRadius: 8,
                      transition: 'background 0.2s',
                    }}
                      onClick={() => {
                        googleLogout();
                        setUser(null);
                      }}
                    >Logout</button>
                  </>
                ) : (
                  <GoogleLogin
                    onSuccess={credentialResponse => {
                      const base64Url = credentialResponse.credential?.split('.')[1];
                      if (base64Url) {
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join(''));
                        setUser(JSON.parse(jsonPayload));
                      }
                    }}
                    onError={() => {
                      alert('Google Login Failed');
                    }}
                    width={180}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}