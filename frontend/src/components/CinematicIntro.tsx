import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { playCinematicRevealSound } from '../services/audio';

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Caching Checks (Once every 24 Hours)
  useEffect(() => {
    if (window.location.search.includes('intro=true') || 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      return;
    }
    const lastPlayed = localStorage.getItem('brotherhood_intro_played');
    if (lastPlayed) {
      const parsedTime = parseInt(lastPlayed, 10);
      const now = Date.now();
      // If played in the last 24 hours, skip it
      if (now - parsedTime < 24 * 60 * 60 * 1000) {
        onComplete();
        return;
      }
    }
    // Record current play time
    localStorage.setItem('brotherhood_intro_played', Date.now().toString());
  }, [onComplete]);

  // 2. Play Sound on Unmute / Interacted
  const triggerSound = () => {
    if (isMuted) {
      setIsMuted(false);
      playCinematicRevealSound();
    }
  };

  // General click anywhere plays the sound if muted to bypass autoplay blocks
  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      if (isMuted) {
        triggerSound();
      }
    }
  };

  // 3. Canvas Gold Particles Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Dynamic floating gold particle specifications
    const particleCount = 60;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
      fadeSpeed: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height + height, // Start from bottom
        radius: Math.random() * 1.5 + 0.5,
        speedY: -(Math.random() * 0.4 + 0.2), // Float up
        speedX: Math.random() * 0.2 - 0.1,
        opacity: Math.random() * 0.6 + 0.2,
        fadeSpeed: Math.random() * 0.005 + 0.002,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`; // Gold hue
        ctx.fill();

        // Update positions
        p.y += p.speedY;
        p.x += p.speedX;

        // Reset if floated above screen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.opacity = Math.random() * 0.6 + 0.2;
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 4. Trigger Auto-exit after 3.8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleExit();
    }, 4200); // Intro plays fully then transitions
    return () => clearTimeout(timer);
  }, []);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 600); // Time to fadeout
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
          onClick={handleInteraction}
          className="fixed inset-0 z-[9999] bg-black select-none overflow-hidden flex flex-col items-center justify-center cursor-pointer"
        >
          {/* Hardware-Accelerated Ambient Aurora Glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Aurora Gold Glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.25 }}
              transition={{ duration: 3.5, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-luxury-gold filter blur-[140px] mix-blend-screen opacity-20"
            />
            {/* Aurora Purple/Indigo Deep Glow */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 0.3 }}
              transition={{ duration: 4.0, ease: 'easeOut', delay: 0.2 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full bg-luxury-purpleDeep filter blur-[160px] mix-blend-screen opacity-25"
            />
          </div>

          {/* Canvas Floating Particles */}
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

          {/* Top Header Row (Sound Control & Skip Button) */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-35 pointer-events-auto">
            {/* Ambient Sound wave bars */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerSound();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-luxury-black bg-opacity-40 border border-luxury-border border-opacity-35 text-[9px] font-bold text-gray-300 uppercase tracking-widest hover:text-luxury-gold transition-colors focus:outline-none"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                  <span>Unmute Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-luxury-gold animate-pulse" />
                  <span className="text-luxury-gold">Audio Active</span>
                </>
              )}
            </button>

            {/* Premium Skip Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleExit();
              }}
              className="px-4 py-1.5 rounded-full border border-luxury-gold border-opacity-35 text-[9px] font-bold uppercase tracking-widest text-luxury-gold bg-luxury-black bg-opacity-40 hover:bg-luxury-gold hover:text-black hover:scale-105 transition-all focus:outline-none"
            >
              Skip Intro
            </button>
          </div>

          {/* Central Logo Sequence */}
          <div className="flex flex-col items-center justify-center text-center space-y-6 z-20">
            {/* SVG Path drawing reveal of Monogram Logo */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-24 h-24"
            >
              {/* Outer Golden Neon Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <motion.circle
                  cx="50"
                  cy="50"
                  r="46"
                  stroke="url(#goldGradient)"
                  strokeWidth="1.5"
                  fill="transparent"
                  strokeDasharray="290"
                  initial={{ strokeDashoffset: 290 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 2.2, ease: [0.43, 0.13, 0.23, 0.96], delay: 0.2 }}
                />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#bf953f" />
                    <stop offset="25%" stopColor="#fcf6ba" />
                    <stop offset="50%" stopColor="#b38728" />
                    <stop offset="75%" stopColor="#fbf5b7" />
                    <stop offset="100%" stopColor="#aa771c" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Inner Monogram Image with Glow */}
              <div className="absolute inset-0 flex items-center justify-center p-1.5">
                <motion.img
                  src="/logo.jpg"
                  alt="Brotherhood Logo"
                  initial={{ filter: 'blur(10px)', opacity: 0, scale: 0.8 }}
                  animate={{ filter: 'blur(0px)', opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, delay: 0.6 }}
                  className="w-full h-full rounded-full object-cover border border-luxury-gold border-opacity-35 shadow-goldGlow"
                />
              </div>
            </motion.div>

            {/* Cinematic Brand Name Reveal (Blur-to-focus, tracking space) */}
            <div className="space-y-1.5">
              <motion.h1
                initial={{ letterSpacing: '0.1em', filter: 'blur(8px)', opacity: 0 }}
                animate={{ letterSpacing: '0.28em', filter: 'blur(0px)', opacity: 1 }}
                transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
                className="text-2xl font-extrabold text-gold-gradient tracking-[0.28em] font-serif uppercase text-center"
              >
                BROTHERHOOD
              </motion.h1>

              <motion.p
                initial={{ letterSpacing: '0.2em', opacity: 0, y: 5 }}
                animate={{ letterSpacing: '0.45em', opacity: 0.8, y: 0 }}
                transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
                className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.45em] text-center"
              >
                CLOTHING
              </motion.p>
            </div>
          </div>

          {/* Interactive cue helper */}
          {!hasInteracted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.45, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 1.5 }}
              className="absolute bottom-10 text-[9px] uppercase tracking-[0.25em] text-gray-500 font-bold"
            >
              Tap Screen to Enable Sound
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
