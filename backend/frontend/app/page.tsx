"use client";
// ...existing code...
import Splash from "./components/Splash";
import MagicSplash from "./components/MagicSplash";
import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Products from "./components/Products";
import Footer from "./components/Footer";

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);
  const [showMagicSplash, setShowMagicSplash] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handler = () => {
      setShowMagicSplash(true);
      setSplashDone(false);
    };
    window.addEventListener('trigger-magic-splash', handler);
    return () => window.removeEventListener('trigger-magic-splash', handler);
  }, []);

  // ...no audio reset logic needed...

  return (
    <>
      {/* Persistent audio element for MagicSplash sound */}
      <audio ref={audioRef} src="/mad_in_heaven_v2.MP3" preload="auto" style={{ display: 'none' }} />
      {/* Main splash, only shows on first load */}
      {!showMagicSplash && <Splash key="splash" onDone={() => setSplashDone(true)} />}
      {/* Magic splash, shows when triggered by event, with sound */}
      {showMagicSplash && (
        <MagicSplash key="magic" onDone={() => { setShowMagicSplash(false); setSplashDone(true); }} playSound />
      )}
      {splashDone && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <main style={{ flex: 1 }}>
            <Header audioRef={audioRef} />
            <Hero />
            <Categories />
            <Products />
          </main>
          <Footer />
        </div>
      )}
    </>
  );
}
