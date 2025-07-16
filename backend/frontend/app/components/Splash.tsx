

'use client';
type SplashProps = { onDone?: () => void; playSound?: boolean };

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Vector from './fresh-food-svgs/Vector.svg';
import Slogan from './fresh-food-svgs/Slogan.svg';
import Food from './fresh-food-svgs/Food.svg';
import Fresh from './fresh-food-svgs/Fresh.svg';
import Basket from './fresh-food-svgs/Basket.svg';
import Cantaloupe from './fresh-food-svgs/cantaloupe.svg';
import Bananas from './fresh-food-svgs/bananas.svg';
import Cherry from './fresh-food-svgs/cherry.svg';
import Apple from './fresh-food-svgs/apple.svg';

// Simple basket fragments for shatter effect
const BasketLeft = (props: any) => (
  <svg width="48" height="48" viewBox="0 0 48 48" {...props}><rect x="0" y="0" width="48" height="48" fill="#F4C542" /></svg>
);
const BasketCenter = (props: any) => (
  <svg width="48" height="48" viewBox="0 0 48 48" {...props}><rect x="0" y="0" width="48" height="48" fill="#E67E22" /></svg>
);
const BasketRight = (props: any) => (
  <svg width="48" height="48" viewBox="0 0 48 48" {...props}><rect x="0" y="0" width="48" height="48" fill="#F9E79F" /></svg>
);

export default function Splash({ onDone, playSound }: SplashProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  // Always call hooks first
  const [phase, setPhase] = useState<'splash' | 'logo' | 'done'>('splash');
  const [scale, setScale] = useState(1); // Default to 1 for SSR
  const [imgError, setImgError] = useState(false);
  const [basketExploded, setBasketExploded] = useState(false);

  // Helper variables and functions
  const positions = {
    Vector: { left: 0, top: -48 },
    Slogan: { left: 487, top: 831 },
    Food: { left: 462, top: 628 },
    Fresh: { left: 460, top: 475 },
    Basket: { left: 442, top: 173 },
    Cantaloupe: { left: 320 + 90, top: 40 },
    Bananas:   { left: 420 + 90, top: 0 },
    Cherry:    { left: 570 + 90, top: 60 },
    Apple:     { left: 700 + 90, top: 30 },
  };
  type LogoPart = keyof typeof positions;
  const fruitFall = (name: LogoPart, delay: number) => ({
    initial: { top: positions[name].top - 120, opacity: 0 },
    animate: { top: positions[name].top, opacity: 1 },
    exit: { opacity: 0 },
    transition: { delay, duration: 1, type: 'spring' as const, bounce: 0.4 },
    style: {
      position: 'absolute' as const,
      left: positions[name].left,
      top: positions[name].top,
      willChange: 'top, opacity',
    } as React.CSSProperties,
  });
  const textFade = (name: LogoPart, delay: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { delay, duration: 0.8 },
    style: {
      position: 'absolute' as const,
      left: positions[name].left,
      top: positions[name].top,
    } as React.CSSProperties,
  });
  const fruitResponsiveStyle = {
    width: 'clamp(60px, 10vw, 120px)',
    height: 'auto',
    maxWidth: '120px',
    minWidth: '40px',
  };

  // Splash phase: fruits fall in, then basket explodes, then logo fades in
  useEffect(() => {
    let basketTimer: NodeJS.Timeout | null = null;
    let logoTimer: NodeJS.Timeout | null = null;
    if (phase === 'splash') {
      // Play sound if playSound is true
      if (playSound && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      // Wait 3.2 seconds, then trigger explosion
      basketTimer = setTimeout(() => {
        setBasketExploded(true);
      }, 3200);
      // Logo phase starts after basket explodes and animation (e.g. 4.8s, was 3.8s)
      logoTimer = setTimeout(() => setPhase('logo'), 4800);
      return () => {
        if (basketTimer) clearTimeout(basketTimer);
        if (logoTimer) clearTimeout(logoTimer);
      };
    }
    if (phase === 'logo') {
      setImgError(false);
      const doneTimer = setTimeout(() => {
        setPhase('done');
        if (onDone) onDone();
      }, 3000); // 1.5s longer
      return () => clearTimeout(doneTimer);
    }
  }, [phase, playSound]);

  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      setScale(Math.max(0.35, Math.min(1, vw / 900)));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <>
      <AnimatePresence mode="wait">
      {phase === 'splash' && (
        <motion.div
          className="splash-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(255,255,255,0.97)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '100vw',
              height: 950,
              position: 'absolute',
              left: '50%',
              top: '58%',
              transform: `translate(-50%, -50%) scale(${scale})`,
              transformOrigin: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            {/* Logo group flexbox for centering */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Fruits row above basket */}
              <AnimatePresence>
                {!basketExploded && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 24 }}>
                    <motion.div initial={{ opacity: 0, y: -120 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 1.1, duration: 1, type: 'spring', bounce: 0.4 }} style={{ ...fruitResponsiveStyle }}><Cantaloupe /></motion.div>
                    <motion.div initial={{ opacity: 0, y: -120 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 1.3, duration: 1, type: 'spring', bounce: 0.4 }} style={{ ...fruitResponsiveStyle }}><Bananas /></motion.div>
                    <motion.div initial={{ opacity: 0, y: -120 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 1.5, duration: 1, type: 'spring', bounce: 0.4 }} style={{ ...fruitResponsiveStyle }}><Cherry /></motion.div>
                    <motion.div initial={{ opacity: 0, y: -120 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 1.7, duration: 1, type: 'spring', bounce: 0.4 }} style={{ ...fruitResponsiveStyle }}><Apple /></motion.div>
                  </div>
                )}
                {basketExploded && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 24 }}>
                    <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0, x: -80, y: -80, rotate: -30 }} transition={{ duration: 0.7, ease: 'easeOut' }} style={{ ...fruitResponsiveStyle }}><Cantaloupe /></motion.div>
                    <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0, x: 80, y: -80, rotate: 30 }} transition={{ duration: 0.7, ease: 'easeOut' }} style={{ ...fruitResponsiveStyle }}><Bananas /></motion.div>
                    <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0, x: -60, y: -100, rotate: -20 }} transition={{ duration: 0.7, ease: 'easeOut' }} style={{ ...fruitResponsiveStyle }}><Cherry /></motion.div>
                    <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0, x: 60, y: -100, rotate: 20 }} transition={{ duration: 0.7, ease: 'easeOut' }} style={{ ...fruitResponsiveStyle }}><Apple /></motion.div>
                  </div>
                )}
              </AnimatePresence>
              {/* Basket centered below fruits */}
              <AnimatePresence>
                {!basketExploded && (
                  <motion.div
                    initial={{ opacity: 0, y: 40, scale: 1 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2, y: -40, rotate: 0 }}
                    transition={{ delay: 0.5, duration: 0.7, ease: 'easeInOut' }}
                    style={{ margin: '0 auto', zIndex: 10000 }}
                  >
                    <Basket />
                  </motion.div>
                )}
                {basketExploded && (
                  <>
                    <motion.div
                      initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                      animate={{ opacity: 0, x: -60, y: -60, rotate: -30 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      style={{ margin: '0 auto', zIndex: 10001 }}
                    >
                      <BasketLeft />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                      animate={{ opacity: 0, y: -80, scale: 1.2 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      style={{ margin: '0 auto', zIndex: 10001 }}
                    >
                      <BasketCenter />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                      animate={{ opacity: 0, x: 60, y: -60, rotate: 30 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      style={{ margin: '0 auto', zIndex: 10001 }}
                    >
                      <BasketRight />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
              {/* Text below basket */}
              <AnimatePresence>
                {!basketExploded && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 32 }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 2.3, duration: 0.8 }}><Fresh /></motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 2.5, duration: 0.8 }}><Food /></motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 2.7, duration: 0.8 }}><Slogan /></motion.div>
                  </div>
                )}
                {basketExploded && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 32 }}>
                    <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0, x: -120, y: -40, scale: 1.2 }} transition={{ duration: 0.7, ease: 'easeOut' }}><Fresh /></motion.div>
                    <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0, x: 120, y: -40, scale: 1.2 }} transition={{ duration: 0.7, ease: 'easeOut' }}><Food /></motion.div>
                    <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0, y: -120, scale: 1.2 }} transition={{ duration: 0.7, ease: 'easeOut' }}><Slogan /></motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
      {phase === 'logo' && (
        <motion.div
          className="splash-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(255,255,255,0.97)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              color: '#fff',
              fontWeight: 900,
              fontSize: '2.8rem',
              marginBottom: '2.2rem',
              letterSpacing: '0.06em',
              textAlign: 'center',
              fontFamily: 'Montserrat, Arial, sans-serif',
              textShadow: '0 2px 8px rgba(230,126,34,0.12)',
            }}
          >
            <span style={{ color: '#F4C542', fontWeight: 900 }}>Fresh</span> <span style={{ color: '#5C7D5C', fontWeight: 900 }}>New Logo</span>
          </motion.div>
          <motion.img
            src="/fresh-food-logo.png"
            alt="Fresh Food Logo"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            style={{
              width: 'min(90vw, 600px)',
              height: 'auto',
              maxHeight: '80vh',
              borderRadius: 16,
              boxShadow: '0 4px 32px 0 rgba(0,0,0,0.08)',
              objectFit: 'contain',
            }}
            onError={() => setImgError(true)}
          />
          {imgError && (
            <div style={{ color: 'red', fontWeight: 600, marginTop: 24 }}>
              Logo image not found. {/* Consider using an SVG for best quality and scalability. */}
            </div>
          )}
          {/* Powered by AI below logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
            style={{
              color: '#F4C542',
              fontWeight: 700,
              fontSize: '1.25rem',
              marginTop: '2.2rem',
              textAlign: 'center',
              fontFamily: 'Inter, Arial, sans-serif',
              letterSpacing: '0.04em',
              textShadow: '0 2px 8px rgba(230,126,34,0.10)',
            }}
          >
            Powered by AI
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}