'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Vector from './fresh-food-svgs/Vector.svg';
import Slogan from './fresh-food-svgs/Slogan.svg';
import Food from './fresh-food-svgs/Food.svg';
import Fresh from './fresh-food-svgs/Fresh.svg';
import Basket from './fresh-food-svgs/Basket.svg';
import Cantaloupe from './fresh-food-svgs/cantaloupe.svg';
import Bananas from './fresh-food-svgs/bananas.svg';
import Cherry from './fresh-food-svgs/cherry.svg';
import Apple from './fresh-food-svgs/apple.svg';

export default function Splash() {
  const [phase, setPhase] = useState<'splash' | 'logo' | 'done'>('splash');
  const [scale, setScale] = useState(1); // Default to 1 for SSR
  const [imgError, setImgError] = useState(false);

  // Splash phase: 4s, then fade out, then logo phase: 1.2s, then done
  useEffect(() => {
    if (phase === 'splash') {
      const timer = setTimeout(() => setPhase('logo'), 4000);
      return () => clearTimeout(timer);
    }
    if (phase === 'logo') {
      setImgError(false); // Reset error state when entering logo phase
      const timer = setTimeout(() => setPhase('done'), 1200);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // All hooks and variables above, now check if done
  if (phase === 'done') return null;

  // Pixel-based positions for fruits and elements (original layout)
  const positions = {
    Vector: { left: 0, top: -48 },
    Slogan: { left: 487, top: 831 },
    Food: { left: 462, top: 628 },
    Fresh: { left: 460, top: 475 },
    Basket: { left: 442, top: 173 },
    // Shift fruits to the right by 90px for better centering
    Cantaloupe: { left: 320 + 90, top: 40 },
    Bananas:   { left: 420 + 90, top: 0 },
    Cherry:    { left: 570 + 90, top: 60 },
    Apple:     { left: 700 + 90, top: 30 },
  };

  // Animation for fruits: start above, fall to their position
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

  // Animation for text: fade in after fruits
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

  // Responsive scale based on viewport width (clamp between 0.35 and 1)
  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      setScale(Math.max(0.35, Math.min(1, vw / 900)));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive fruit size helper
  const fruitResponsiveStyle = {
    width: 'clamp(60px, 10vw, 120px)',
    height: 'auto',
    maxWidth: '120px',
    minWidth: '40px',
  };

  return (
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
              width: 900,
              height: 950,
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) scale(${scale})`,
              transformOrigin: 'center',
              maxWidth: '98vw',
              maxHeight: '98vh',
              minWidth: 320,
              minHeight: 340,
            }}
          >
            {/* Basket appears first, then fruits fall in */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, type: 'spring', bounce: 0.2 }}
              style={{
                position: 'absolute',
                left: positions.Basket.left,
                top: positions.Basket.top,
                transform: 'translate(-50%, 0)',
              }}
            >
              <Basket />
            </motion.div>
            {/* Fruits falling in, after basket appears */}
            <motion.div {...fruitFall('Cantaloupe', 1.1)} style={{ ...fruitFall('Cantaloupe', 1.1).style, ...fruitResponsiveStyle }}><Cantaloupe /></motion.div>
            <motion.div {...fruitFall('Bananas', 1.3)} style={{ ...fruitFall('Bananas', 1.3).style, ...fruitResponsiveStyle }}><Bananas /></motion.div>
            <motion.div {...fruitFall('Cherry', 1.5)} style={{ ...fruitFall('Cherry', 1.5).style, ...fruitResponsiveStyle }}><Cherry /></motion.div>
            <motion.div {...fruitFall('Apple', 1.7)} style={{ ...fruitFall('Apple', 1.7).style, ...fruitResponsiveStyle }}><Apple /></motion.div>
            {/* Text fades in after fruits */}
            <motion.div {...textFade('Fresh', 2.3)}><Fresh /></motion.div>
            <motion.div {...textFade('Food', 2.5)}><Food /></motion.div>
            <motion.div {...textFade('Slogan', 2.7)}><Slogan /></motion.div>
          </div>
        </motion.div>
      )}
      {phase === 'logo' && (
        <motion.div
          className="splash-overlay"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
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
          <img
            src="/fresh-food-logo.png"
            alt="Fresh Food Logo"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}