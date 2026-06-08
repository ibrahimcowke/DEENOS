import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, RefreshCw, Circle, Heart, Sparkles, Sliders, Fingerprint } from 'lucide-react';

interface TasbihBeadsProps {
  count: number;
  target: number;
  onIncrement: () => void;
  onReset: () => void;
}

export const TasbihBeads: React.FC<TasbihBeadsProps> = ({ count, target, onIncrement, onReset }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeShape, setActiveShape] = useState<'circle' | 'linear' | 'heart' | 'flower' | 'classic'>('circle');

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

  // Shape 1: Circle configurations
  const totalBeads = 12;
  const radius = 88; // Radius of circular track in pixels
  const activeIdx = count % totalBeads;
  const rotation = -count * (360 / totalBeads);

  // Shape 2: Heart configurations
  const heartBeadsCount = 14;
  const activeHeartIdx = count % heartBeadsCount;
  const getHeartPoint = (idx: number, total: number) => {
    const theta = (idx * (2 * Math.PI) / total) - Math.PI;
    const sinT = Math.sin(theta);
    const x = 16 * Math.pow(sinT, 3);
    const y = -(13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta));
    const scale = 5.2;
    const yOffset = -22;
    return { x: x * scale, y: y * scale + yOffset };
  };

  const heartPathPoints = Array.from({ length: 60 }).map((_, i) => {
    const theta = (i * (2 * Math.PI) / 60) - Math.PI;
    const sinT = Math.sin(theta);
    const x = 16 * Math.pow(sinT, 3) * 5.2;
    const y = -(13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta)) * 5.2 - 22;
    return `${x + 144},${y + 144}`;
  }).join(' L ');
  const heartD = `M ${heartPathPoints} Z`;

  // Shape 3: Flower (Lotus) configurations
  const flowerBeadsCount = 12;
  const activeFlowerIdx = count % flowerBeadsCount;
  const getFlowerPoint = (idx: number, total: number) => {
    const theta = (idx * (2 * Math.PI) / total) - Math.PI / 2;
    const petals = 5;
    const depth = 0.22;
    const baseRadius = 74;
    const r = baseRadius * (1 + depth * Math.cos(petals * theta));
    return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
  };

  const flowerPathPoints = Array.from({ length: 80 }).map((_, i) => {
    const theta = (i * (2 * Math.PI) / 80) - Math.PI / 2;
    const r = 74 * (1 + 0.22 * Math.cos(5 * theta));
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    return `${x + 144},${y + 144}`;
  }).join(' L ');
  const flowerD = `M ${flowerPathPoints} Z`;
  const rotationFlower = -count * (360 / flowerBeadsCount);

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
        {/* Shape 1: Circle */}
        {activeShape === 'circle' && (
          <>
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
                    <div className="absolute top-1.5 left-1.5 w-2 h-1 rounded-full bg-white/30 rotate-[-30deg]" />
                  </div>
                );
              })}
            </motion.div>
          </>
        )}

        {/* Shape 2: Linear (Vertical Sliding Thread) */}
        {activeShape === 'linear' && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* Guide line indicator in center */}
            <div className="absolute left-[calc(50%-28px)] right-[calc(50%-28px)] h-10 border-y border-dashed border-primary/45 bg-primary/5 pointer-events-none z-10 rounded-md flex items-center justify-between px-1">
              <span className="text-[8px] font-bold text-primary animate-pulse">◀</span>
              <span className="text-[8px] font-bold text-primary animate-pulse">▶</span>
            </div>

            {/* Vertical Thread Line */}
            <div className="absolute top-0 bottom-0 w-[1px] border-l border-dashed border-primary/20 pointer-events-none" />

            {/* Sliding Beads List Container */}
            <motion.div
              animate={{ y: count * 42 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              {Array.from({ length: 11 }).map((_, idx) => {
                const beadIndex = count - 5 + idx;
                const isActive = beadIndex === count;

                return (
                  <div
                    key={beadIndex}
                    className="absolute w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-300"
                    style={{
                      top: `calc(50% - ${beadIndex * 42}px - 16px)`,
                      left: 'calc(50% - 16px)',
                      background: isActive
                        ? 'radial-gradient(circle at 35% 35%, var(--accent-secondary) 0%, var(--primary) 70%, var(--primary-hover) 100%)'
                        : 'radial-gradient(circle at 35% 35%, var(--bg-tertiary) 0%, var(--border-color) 70%, var(--text-muted) 100%)',
                      boxShadow: isActive 
                        ? '0 0 16px var(--primary-glow), inset 0 2px 4px rgba(255,255,255,0.4)' 
                        : 'inset 0 1px 2px rgba(255,255,255,0.2)',
                      border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`,
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      zIndex: isActive ? 5 : 1
                    }}
                  >
                    <div className="absolute top-1.5 left-1.5 w-2 h-1 rounded-full bg-white/30 rotate-[-30deg]" />
                  </div>
                );
              })}
            </motion.div>

            {/* Floating Counter Display */}
            <div className="absolute top-4 right-4 bg-primary/10 border border-primary/25 backdrop-blur-md px-3 py-1 rounded-xl flex flex-col items-end pointer-events-none z-10 shadow-sm animate-in fade-in duration-200">
              <span className="text-xl font-black text-primary leading-none">{count}</span>
              <span className="text-[8px] font-bold text-text-secondary uppercase tracking-wider mt-0.5">Target: {target}</span>
            </div>
          </div>
        )}

        {/* Shape 3: Heart */}
        {activeShape === 'heart' && (
          <>
            {/* Heart guide line SVG */}
            <svg className="absolute w-72 h-72 pointer-events-none stroke-primary/20 fill-none stroke-dashed" strokeWidth="1" strokeDasharray="3,3">
              <path d={heartD} />
            </svg>

            {/* Heart Beads */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {Array.from({ length: heartBeadsCount }).map((_, idx) => {
                const { x, y } = getHeartPoint(idx, heartBeadsCount);
                const isActive = idx === activeHeartIdx;

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
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      zIndex: isActive ? 5 : 1
                    }}
                  >
                    <div className="absolute top-1.5 left-1.5 w-2 h-1 rounded-full bg-white/30 rotate-[-30deg]" />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Shape 4: Flower (Lotus) */}
        {activeShape === 'flower' && (
          <>
            {/* Flower guide line SVG */}
            <svg className="absolute w-72 h-72 pointer-events-none stroke-primary/20 fill-none stroke-dashed" strokeWidth="1" strokeDasharray="3,3">
              <motion.path 
                d={flowerD} 
                animate={{ rotate: rotationFlower }} 
                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                style={{ transformOrigin: '144px 144px' }}
              />
            </svg>

            {/* Flower Beads */}
            <motion.div 
              animate={{ rotate: rotationFlower }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              {Array.from({ length: flowerBeadsCount }).map((_, idx) => {
                const { x, y } = getFlowerPoint(idx, flowerBeadsCount);
                const isActive = idx === activeFlowerIdx;

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
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      zIndex: isActive ? 5 : 1
                    }}
                  >
                    <div className="absolute top-1.5 left-1.5 w-2 h-1 rounded-full bg-white/30 rotate-[-30deg]" />
                  </div>
                );
              })}
            </motion.div>
          </>
        )}

        {/* Shape 5: Classic (Digital Glow Counters) */}
        {activeShape === 'classic' && (
          <div className="flex flex-col items-center justify-center w-full h-full relative">
            <motion.div
              whileTap={{ scale: 0.94 }}
              className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/5 to-primary/20 border border-primary/20 shadow-xl flex flex-col items-center justify-center relative select-none"
              style={{
                boxShadow: '0 0 32px var(--primary-glow), inset 0 2px 8px rgba(255,255,255,0.05)',
              }}
            >
              <div className="absolute inset-2 rounded-full border border-dashed border-primary/25 animate-spin-slow pointer-events-none" />
              
              {/* Ripple Pulse effect on tap */}
              <motion.div
                key={count}
                initial={{ scale: 0.85, opacity: 0.6 }}
                animate={{ scale: 1.1, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-primary/20 pointer-events-none"
              />

              <motion.span
                key={count}
                initial={{ scale: 0.8, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-black text-text-primary tracking-tight"
              >
                {count}
              </motion.span>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">
                Target: {target}
              </span>
            </motion.div>
          </div>
        )}

        {/* Inner Counter Display Box (Static in center) - only rendered for circle, heart, flower */}
        {(activeShape === 'circle' || activeShape === 'heart' || activeShape === 'flower') && (
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
        )}
      </div>

      {/* Tap Instruction */}
      <div className="text-xs text-text-muted text-center pointer-events-none mt-2">
        Tap anywhere inside the box to log a count
      </div>

      {/* Shape Selector Bar */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-border-color/60 w-full justify-around">
        {[
          { key: 'circle', icon: Circle, label: 'Circle' },
          { key: 'linear', icon: Sliders, label: 'Thread' },
          { key: 'heart', icon: Heart, label: 'Heart' },
          { key: 'flower', icon: Sparkles, label: 'Lotus' },
          { key: 'classic', icon: Fingerprint, label: 'Digital' },
        ].map((s) => {
          const Icon = s.icon;
          const isSelected = activeShape === s.key;
          return (
            <button
              key={s.key}
              onClick={(e) => {
                e.stopPropagation();
                setActiveShape(s.key as any);
              }}
              title={s.label}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer flex-1 max-w-[56px] ${
                isSelected
                  ? 'bg-primary/10 border border-primary/30 text-primary animate-in fade-in duration-200'
                  : 'bg-bg-secondary/40 border border-transparent text-text-muted hover:text-text-secondary hover:bg-bg-primary/50'
              }`}
            >
              <Icon size={14} className={isSelected ? 'stroke-[2.5]' : ''} />
              <span className="text-[8px] font-extrabold uppercase tracking-wide">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TasbihBeads;
