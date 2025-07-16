"use client";
type MagicSplashProps = { onDone?: () => void; playSound?: boolean };

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

const BasketLeft = (props: any) => (
  <svg width="48" height="48" viewBox="0 0 48 48" {...props}><rect x="0" y="0" width="48" height="48" fill="#F4C542" /></svg>
);
const BasketCenter = (props: any) => (
  <svg width="48" height="48" viewBox="0 0 48 48" {...props}><rect x="0" y="0" width="48" height="48" fill="#E67E22" /></svg>
);
const BasketRight = (props: any) => (
  <svg width="48" height="48" viewBox="0 0 48 48" {...props}><rect x="0" y="0" width="48" height="48" fill="#F9E79F" /></svg>
);

export default function MagicSplash({ onDone, playSound }: MagicSplashProps) {
  // Audio logic moved to parent component for persistent playback
  const [phase, setPhase] = useState<'splash' | 'logo' | 'rewind' | 'done'>('splash');
  const [showRewind, setShowRewind] = useState(false);
  const [scale, setScale] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [basketExploded, setBasketExploded] = useState(false);
  // Made In Heaven meme: progressive spin and shrink
  const [spin, setSpin] = useState(0); // degrees
  const [logoScale, setLogoScale] = useState(1);
  const spinRef = useRef(spin);
  const scaleRef = useRef(logoScale);

  useEffect(() => {
    if (phase === 'splash') {
      let running = true;
      let speed = 0.5; // initial speed (slower)
      let shrink = 1;
      function animate() {
        if (!running) return;
        speed = Math.min(speed * 1.035, 120); // accelerate
        shrink = Math.max(shrink * 0.995, 0.18); // shrink
        spinRef.current += speed;
        scaleRef.current = shrink;
        setSpin(spinRef.current);
        setLogoScale(scaleRef.current);
        requestAnimationFrame(animate);
      }
      animate();
      return () => { running = false; };
    }
  }, [phase]);

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

  useEffect(() => {
    let basketTimer: NodeJS.Timeout | null = null;
    let logoTimer: NodeJS.Timeout | null = null;
    if (phase === 'splash') {
      basketTimer = setTimeout(() => {
        setBasketExploded(true);
      }, 3000);
      logoTimer = setTimeout(() => setPhase('logo'), 4800);
      return () => {
        if (basketTimer) clearTimeout(basketTimer);
        if (logoTimer) clearTimeout(logoTimer);
      };
    }
    if (phase === 'logo') {
      setImgError(false);
      // Show logo for 2.2s, then show rewind overlay for 2.3s
      const logoTimer = setTimeout(() => {
        setShowRewind(true);
        setPhase('rewind');
        setTimeout(() => {
          setShowRewind(false);
          setPhase('done');
          if (onDone) onDone();
        }, 2300);
      }, 2200);
      return () => clearTimeout(logoTimer);
    }
  }, [phase]);

  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      setScale(Math.max(0.35, Math.min(1, vw / 900)));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Calculate orbit transform for earth-like movement using current state
  const orbitRadius = 180;
  const orbitX = orbitRadius * Math.sin(spin * Math.PI / 180);
  const orbitY = orbitRadius * Math.cos(spin * Math.PI / 180);
  const orbitTransform = `translate(-50%, -50%) translateX(${orbitX}px) translateY(${orbitY}px) rotate(${spin}deg) scale(${logoScale})`;
  return (
    <>
      {/* Only show the spinning/shrinking logo for meme effect during splash phase */}
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
              justifyContent: 'center',
            }}
          >
            <motion.div
              key="made-in-heaven-final-logo"
              style={{
                width: 320,
                height: 320,
                maxHeight: '60vh',
                borderRadius: 16,
                boxShadow: '0 4px 32px 0 rgba(0,0,0,0.08)',
                zIndex: 10002,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: orbitTransform,
                filter: logoScale < 0.25 ? 'blur(2px)' : 'none',
              }}
              transition={{
                type: 'tween',
                ease: 'linear',
                duration: 0.1,
              }}
            >
              {/* Assembled logo: all SVGs in their final positions, no Vector */}
              <div style={{ position: 'relative', width: 320, height: 320 }}>
                <Slogan style={{ position: 'absolute', left: 487 - 320, top: 831 - 320 }} />
                <Food style={{ position: 'absolute', left: 462 - 320, top: 628 - 320 }} />
                <Fresh style={{ position: 'absolute', left: 460 - 320, top: 475 - 320 }} />
                <Basket style={{ position: 'absolute', left: 442 - 320, top: 173 - 320 }} />
                <Cantaloupe style={{ position: 'absolute', left: 410 - 320, top: 40 }} />
                <Bananas style={{ position: 'absolute', left: 510 - 320, top: 0 }} />
                <Cherry style={{ position: 'absolute', left: 660 - 320, top: 60 }} />
                <Apple style={{ position: 'absolute', left: 790 - 320, top: 30 }} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
      {/* Audio element removed; now handled by parent component for persistent playback */}
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
      {/* Simple rewind overlay animation after logo phase */}
      {showRewind && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
            zIndex: 10010,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            filter: 'grayscale(0.7) brightness(1.2) contrast(1.2) blur(1px)',
            animation: 'tv-flicker 0.7s linear',
          }}
        >
          {/* Static noise overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              zIndex: 10011,
              background: 'url("data:image/svg+xml,%3Csvg width=\'1200\' height=\'800\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'1200\' height=\'800\' fill=\'%231a1a2e\'/%3E%3Cg%3E%3Ccircle cx=\'100\' cy=\'100\' r=\'1.5\' fill=\'%23fff\'/%3E%3Ccircle cx=\'200\' cy=\'300\' r=\'1.2\' fill=\'%23fff\'/%3E%3Ccircle cx=\'400\' cy=\'500\' r=\'1.1\' fill=\'%23fff\'/%3E%3Ccircle cx=\'600\' cy=\'700\' r=\'1.3\' fill=\'%23fff\'/%3E%3Ccircle cx=\'800\' cy=\'200\' r=\'1.4\' fill=\'%23fff\'/%3E%3Ccircle cx=\'1000\' cy=\'600\' r=\'1.2\' fill=\'%23fff\'/%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.18,
              mixBlendMode: 'screen',
              animation: 'static-noise 0.18s steps(2) infinite',
            }}
          />
          {/* Scan lines overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              zIndex: 10012,
              background: `repeating-linear-gradient(
                to bottom,
                rgba(255,255,255,0.04) 0px,
                rgba(255,255,255,0.04) 2px,
                transparent 2px,
                transparent 6px
              )`,
              animation: 'scanlines-move 0.7s linear infinite',
            }}
          />
          <div style={{ textAlign: 'center', zIndex: 10013 }}>
            {/* Classic rewind button/icon: circle with double left arrow */}
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="44" stroke="#F4C542" strokeWidth="8" fill="rgba(0,0,0,0.18)" />
              <polygon points="60,35 60,65 40,50" fill="#F4C542" />
              <polygon points="75,35 75,65 55,50" fill="#F4C542" />
            </svg>
          </div>
          {/* Keyframes for flicker, scanlines, and static noise */}
          <style>{`
            @keyframes tv-flicker {
              0% { filter: grayscale(0.7) brightness(1.2) contrast(1.2) blur(1px); }
              10% { filter: grayscale(0.9) brightness(1.4) contrast(1.4) blur(2px); }
              20% { filter: grayscale(0.7) brightness(1.1) contrast(1.1) blur(0.5px); }
              30% { filter: grayscale(0.8) brightness(1.3) contrast(1.3) blur(1.5px); }
              40% { filter: grayscale(0.7) brightness(1.2) contrast(1.2) blur(1px); }
              100% { filter: grayscale(0.7) brightness(1.2) contrast(1.2) blur(1px); }
            }
            @keyframes scanlines-move {
              0% { background-position-y: 0; }
              100% { background-position-y: 8px; }
            }
            @keyframes static-noise {
              0% { opacity: 0.18; }
              50% { opacity: 0.28; }
              100% { opacity: 0.18; }
            }
          `}</style>
        </motion.div>
      )}
    </>
  );
}
