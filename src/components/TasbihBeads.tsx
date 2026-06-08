import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface TasbihBeadsProps {
  count: number;
  target: number;
  onIncrement: () => void;
  onReset: () => void;
}

export const TasbihBeads: React.FC<TasbihBeadsProps> = ({ count, target, onIncrement, onReset }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

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
      navigator.vibrate(20);
    }
  };

  const handleTap = () => {
    playClickSound();
    triggerHaptic();
    onIncrement();
  };

  // 12 beads in the circle
  const totalBeads = 12;
  const radius = 88; // Radius of circular track in pixels
  const activeIdx = count % totalBeads;
  const rotation = -count * (360 / totalBeads);

  return (
    <div className="flex flex-col items-center p-6 glass-card border border-border-color rounded-2xl w-full max-w-sm mx-auto shadow-lg relative overflow-hidden select-none bg-bg-secondary/20">
      
      {/* Sound Toggle and Reset Buttons */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSoundEnabled(!soundEnabled);
          }}
          className="p-2 rounded-full hover:bg-primary/10 text-text-secondary hover:text-primary transition cursor-pointer"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          className="p-2 rounded-full hover:bg-primary/10 text-text-secondary hover:text-primary transition cursor-pointer"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Main Interactive Tap Area */}
      <div 
        className="h-72 w-full flex items-center justify-center relative cursor-pointer" 
        onClick={handleTap}
      >
        {/* Subtle guide slot / pointer at 12 o'clock */}
        <div className="absolute top-[38px] w-6 h-6 rounded-full border border-primary/45 bg-primary/5 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
        </div>

        {/* Circular Bead Track / Thread Line */}
        <div 
          className="absolute rounded-full border border-dashed border-primary/20 pointer-events-none"
          style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}
        />

        {/* Rotating Beads Ring */}
        <motion.div 
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="relative flex items-center justify-center pointer-events-none"
          style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}
        >
          {Array.from({ length: totalBeads }).map((_, idx) => {
            const angleInRad = (idx * (360 / totalBeads) * Math.PI) / 180 - Math.PI / 2;
            const x = radius * Math.cos(angleInRad);
            const y = radius * Math.sin(angleInRad);
            const isActive = idx === activeIdx;

            return (
              <div
                key={idx}
                className="absolute w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-300"
                style={{
                  left: `calc(50% + ${x}px - 16px)`,
                  top: `calc(50% + ${y}px - 16px)`,
                  background: isActive
                    ? 'radial-gradient(circle at 35% 35%, var(--accent-secondary) 0%, var(--primary) 70%, var(--primary-hover) 100%)'
                    : 'radial-gradient(circle at 35% 35%, var(--bg-tertiary) 0%, var(--border-color) 70%, var(--text-muted) 100%)',
                  boxShadow: isActive 
                    ? '0 0 16px var(--primary-glow), inset 0 2px 4px rgba(255,255,255,0.4)' 
                    : 'inset 0 1px 2px rgba(255,255,255,0.2)',
                  border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`,
                  transform: isActive ? 'scale(1.15)' : 'scale(1)'
                }}
              >
                {/* Bead reflection shine */}
                <div className="absolute top-1.5 left-1.5 w-2 h-1 rounded-full bg-white/30 rotate-[-30deg]" />
              </div>
            );
          })}
        </motion.div>

        {/* Inner Counter Display Box (Static in center) */}
        <div className="absolute w-32 h-32 rounded-full bg-bg-primary/95 border border-border-color shadow-inner flex flex-col items-center justify-center pointer-events-none z-0">
          <motion.span
            key={count}
            initial={{ scale: 0.85, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-text-primary"
          >
            {count}
          </motion.span>
          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mt-1">
            Target: {target}
          </span>
        </div>
      </div>

      {/* Tap Instruction */}
      <div className="text-xs text-text-muted text-center pointer-events-none mt-2">
        Tap anywhere inside the box to log a count
      </div>
    </div>
  );
};

export default TasbihBeads;
