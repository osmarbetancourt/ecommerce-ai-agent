
"use client";
import Splash from "./components/Splash";
import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Products from "./components/Products";
import Footer from "./components/Footer";

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      <Splash key="splash" onDone={() => setSplashDone(true)} />
      {splashDone && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <main style={{ flex: 1 }}>
            <Header />
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
