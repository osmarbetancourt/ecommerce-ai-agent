"use client";
// ...existing code...
import Splash from "./components/Splash";
import MagicSplash from "./components/MagicSplash";
import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Categories from "./components/Categories";
import Products from "./components/Products";
import Footer from "./components/Footer";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);
  const [showMagicSplash, setShowMagicSplash] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [showSplashAfterMagic, setShowSplashAfterMagic] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Only show splash if not seen before
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("splashSeen")) {
        setShowSplash(true);
      } else {
        setSplashDone(true);
      }
    }
    const handler = () => {
      setShowMagicSplash(true);
      setSplashDone(false);
    };
    window.addEventListener('trigger-magic-splash', handler);
    return () => window.removeEventListener('trigger-magic-splash', handler);
  }, []);

  // When splash finishes, mark as seen
  const handleSplashDone = () => {
    setSplashDone(true);
    setShowSplash(false);
    setShowSplashAfterMagic(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("splashSeen", "true");
    }
  };

  // When MagicSplash finishes, trigger Splash (after magic)
  const handleMagicSplashDone = () => {
    setShowMagicSplash(false);
    setShowSplashAfterMagic(true);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      {/* Persistent audio element for MagicSplash sound */}
      <audio ref={audioRef} src="/mad_in_heaven_v2.MP3" preload="auto" style={{ display: 'none' }} />
      {/* Main splash, only shows on first load */}
      {showSplash && <Splash key="splash" onDone={handleSplashDone} />}
      {/* Magic splash, shows when triggered by event, with sound */}
      {showMagicSplash && (
        <MagicSplash key="magic" onDone={handleMagicSplashDone} playSound />
      )}
      {/* Splash after MagicSplash */}
      {showSplashAfterMagic && <Splash key="splash-after-magic" onDone={handleSplashDone} />}
      {splashDone && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <main style={{ flex: 1 }}>
            <Header audioRef={audioRef} />
            <Products />
            <Categories />
          </main>
          <Footer />
        </div>
      )}
    </GoogleOAuthProvider>
  );
}
