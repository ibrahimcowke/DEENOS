import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface TasbihBeadsProps {
  count: number;
  target: number;
  onIncrement: () => void;
  onReset: () => void;
}

export const TasbihBeads: React.FC<TasbihBeadsProps> = ({ count, target, onIncrement, onReset }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const controls = useAnimation();

  // Synthetic click sound using Web Audio API
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Mimic a light wooden/plastic bead click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.06);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {
      console.warn('Web Audio blocked or unsupported', e);
    }
  };

  // Trigger vibration haptics
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      // Short 20ms pulse
      navigator.vibrate(20);
    }
  };

  const handleTap = async () => {
    playClickSound();
    triggerHaptic();
    onIncrement();

    // Slide beads downward animation
    await controls.start({ y: 56, transition: { duration: 0.12, ease: "easeOut" } });
    // Snap back instantly to simulate infinite string
    await controls.start({ y: 0, transition: { duration: 0 } });
  };

  // We display 5 beads, sliding down
  const beadOffsets = [-112, -56, 0, 56, 112];

  return (
    <div className="flex flex-col items-center p-6 glass-card border border-border-color rounded-2xl w-full max-w-sm mx-auto shadow-lg relative overflow-hidden">
      {/* Sound Toggle and Reset Buttons */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-full hover:bg-primary/10 text-text-secondary hover:text-primary transition"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button
          onClick={onReset}
          className="p-2 rounded-full hover:bg-primary/10 text-text-secondary hover:text-primary transition"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Bead Thread Guide Lines */}
      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gradient-to-b from-primary/10 via-primary/30 to-primary/10 -translate-x-1/2 pointer-events-none" />

      {/* Beads Container (Infinite scrolling effect) */}
      <div className="h-64 flex items-center justify-center relative w-full overflow-hidden select-none cursor-pointer" onClick={handleTap}>
        <motion.div animate={controls} className="absolute flex flex-col items-center">
          {beadOffsets.map((offset, idx) => {
            // Highlight bead in the center (offset 0 before animation)
            const isCenter = idx === 2;
            return (
              <div
                key={idx}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative shadow-md"
                style={{
                  transform: `translateY(${offset}px)`,
                  background: isCenter
                    ? 'radial-gradient(circle at 35% 35%, var(--accent-secondary) 0%, var(--primary) 70%, var(--primary-hover) 100%)'
                    : 'radial-gradient(circle at 35% 35%, var(--bg-tertiary) 0%, var(--border-color) 70%, var(--text-muted) 100%)',
                  boxShadow: isCenter ? '0 0 16px var(--primary-glow), inset 0 2px 4px rgba(255,255,255,0.4)' : 'inset 0 1px 2px rgba(255,255,255,0.2)',
                  border: `1px solid ${isCenter ? 'var(--primary)' : 'var(--border-color)'}`
                }}
              >
                {/* Bead reflection shine */}
                <div className="absolute top-1.5 left-1.5 w-2.5 h-1.5 rounded-full bg-white/30 rotate-[-30deg]" />
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Counter Readouts */}
      <div className="mt-4 text-center z-10 pointer-events-none">
        <motion.span
          key={count}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-extrabold tracking-tight text-text-primary block"
        >
          {count}
        </motion.span>
        <span className="text-sm font-medium text-text-secondary uppercase tracking-widest mt-1 block">
          Target: {target}
        </span>
      </div>

      {/* Helpful Hint */}
      <div className="mt-6 text-xs text-text-muted text-center pointer-events-none">
        Tap anywhere inside the box to log a count
      </div>
    </div>
  );
};
export default TasbihBeads;
