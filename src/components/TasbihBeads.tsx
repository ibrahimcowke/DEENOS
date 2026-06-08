import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, RefreshCw, Circle, Moon, Box, Sun, Compass } from 'lucide-react';

interface TasbihBeadsProps {
  count: number;
  target: number;
  onIncrement: () => void;
  onReset: () => void;
}

export const TasbihBeads: React.FC<TasbihBeadsProps> = ({ count, target, onIncrement, onReset }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeShape, setActiveShape] = useState<'circle' | 'crescent' | 'kaaba' | 'star' | 'dome'>('circle');

  // Synthetic click sound using Web Audio API
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
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

  const totalBeads = 12;
  const radius = 88;
  const activeIdx = count % totalBeads;
  const rotation = -count * (360 / totalBeads);

  const crescentBeadsCount = 12;
  const activeCrescentIdx = count % crescentBeadsCount;
  const getCrescentPoint = (idx: number, total: number) => {
    const theta = -Math.PI * 0.76 + idx * (2 * Math.PI * 0.76) / (total - 1);
    const x = -76 * Math.cos(theta) + 26 * Math.cos(theta / 2.2) - 8;
    const y = 78 * Math.sin(theta);
    return { x, y };
  };

  const crescentPathPoints = Array.from({ length: 60 }).map((_, i) => {
    const theta = -Math.PI * 0.76 + i * (2 * Math.PI * 0.76) / 59;
    const x = -76 * Math.cos(theta) + 26 * Math.cos(theta / 2.2) - 8;
    const y = 78 * Math.sin(theta);
    return `${x + 144},${y + 144}`;
  }).join(' L ');
  const crescentD = `M ${crescentPathPoints}`;

  const kaabaBeadsCount = 12;
  const activeKaabaIdx = count % kaabaBeadsCount;
  const getKaabaPoint = (idx: number) => {
    const points = [
      { x: -65, y: -65 }, { x: -21.7, y: -65 }, { x: 21.7, y: -65 }, { x: 65, y: -65 },
      { x: 65, y: -21.7 }, { x: 65, y: 21.7 }, { x: 65, y: 65 }, { x: 21.7, y: 65 },
      { x: -21.7, y: 65 }, { x: -65, y: 65 }, { x: -65, y: 21.7 }, { x: -65, y: -21.7 }
    ];
    return points[idx % 12];
  };
  const kaabaD = "M 79 79 L 209 79 L 209 209 L 79 209 Z";

  const starBeadsCount = 16;
  const activeStarIdx = count % starBeadsCount;
  const getStarPoint = (idx: number) => {
    const theta = idx * (Math.PI / 8) - Math.PI / 2;
    const r = idx % 2 === 0 ? 84 : 60;
    return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
  };

  const starPathPoints = Array.from({ length: 17 }).map((_, i) => {
    const idx = i % 16;
    const theta = idx * (Math.PI / 8) - Math.PI / 2;
    const r = idx % 2 === 0 ? 84 : 60;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    return `${x + 144},${y + 144}`;
  }).join(' L ');
  const starD = `M ${starPathPoints} Z`;

  const domeBeadsCount = 12;
  const activeDomeIdx = count % domeBeadsCount;
  const domePoints = [
    { x: -65, y: 75 }, { x: -65, y: 30 }, { x: -65, y: -15 }, { x: -52, y: -48 },
    { x: -30, y: -68 }, { x: 0, y: -80 }, { x: 30, y: -68 }, { x: 52, y: -48 },
    { x: 65, y: -15 }, { x: 65, y: 30 }, { x: 65, y: 75 }, { x: 0, y: 75 }
  ];
  const getDomePoint = (idx: number) => domePoints[idx % 12];
  const domeD = `M ${domePoints.map(p => `${p.x + 144},${p.y + 144}`).join(' L ')} Z`;

  return (
    <div className="flex flex-col items-center p-6 glass-card border border-border-color rounded-2xl w-full max-w-sm mx-auto shadow-lg relative overflow-hidden select-none bg-bg-secondary/20">
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <button onClick={(e) => { e.stopPropagation(); setSoundEnabled(!soundEnabled); }} className="p-2 rounded-full hover:bg-primary/10 text-text-secondary hover:text-primary transition cursor-pointer">
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onReset(); }} className="p-2 rounded-full hover:bg-primary/10 text-text-secondary hover:text-primary transition cursor-pointer">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="h-72 w-full flex items-center justify-center relative cursor-pointer" onClick={handleTap}>
        {activeShape === 'circle' && (
          <motion.div animate={{ rotate: rotation }} transition={{ type: 'spring', stiffness: 220, damping: 24 }} className="relative flex items-center justify-center pointer-events-none" style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}>
            {Array.from({ length: totalBeads }).map((_, idx) => {
              const angleInRad = (idx * (360 / totalBeads) * Math.PI) / 180 - Math.PI / 2;
              const x = radius * Math.cos(angleInRad);
              const y = radius * Math.sin(angleInRad);
              const isActive = idx === activeIdx;
              return (
                <div key={idx} className="absolute w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-300" style={{ left: `calc(50% + ${x}px - 16px)`, top: `calc(50% + ${y}px - 16px)`, background: isActive ? 'radial-gradient(circle at 35% 35%, var(--accent-secondary) 0%, var(--primary) 70%, var(--primary-hover) 100%)' : 'radial-gradient(circle at 35% 35%, var(--bg-tertiary) 0%, var(--border-color) 70%, var(--text-muted) 100%)', boxShadow: isActive ? '0 0 16px var(--primary-glow), inset 0 2px 4px rgba(255,255,255,0.4)' : 'inset 0 1px 2px rgba(255,255,255,0.2)', border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`, transform: isActive ? 'scale(1.15)' : 'scale(1)' }}>
                  <div className="absolute top-1.5 left-1.5 w-2 h-1 rounded-full bg-white/30 rotate-[-30deg]" />
                </div>
              );
            })}
          </motion.div>
        )}

        {activeShape === 'crescent' && (
          <>
            <svg className="absolute w-72 h-72 pointer-events-none stroke-primary/20 fill-none stroke-dashed" strokeWidth="1" strokeDasharray="3,3"><path d={crescentD} /></svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {Array.from({ length: crescentBeadsCount }).map((_, idx) => {
                const { x, y } = getCrescentPoint(idx, crescentBeadsCount);
                const isActive = idx === activeCrescentIdx;
                return (
                  <div key={idx} className="absolute w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-300" style={{ left: `calc(50% + ${x}px - 16px)`, top: `calc(50% + ${y}px - 16px)`, background: isActive ? 'radial-gradient(circle at 35% 35%, var(--accent-secondary) 0%, var(--primary) 70%, var(--primary-hover) 100%)' : 'radial-gradient(circle at 35% 35%, var(--bg-tertiary) 0%, var(--border-color) 70%, var(--text-muted) 100%)', boxShadow: isActive ? '0 0 16px var(--primary-glow), inset 0 2px 4px rgba(255,255,255,0.4)' : 'inset 0 1px 2px rgba(255,255,255,0.2)', border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`, transform: isActive ? 'scale(1.15)' : 'scale(1)', zIndex: isActive ? 5 : 1 }}>
                    <div className="absolute top-1.5 left-1.5 w-2 h-1 rounded-full bg-white/30 rotate-[-30deg]" />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeShape === 'kaaba' && (
          <>
            <div className="absolute w-28 h-28 bg-[#0c1814] border border-[#c29845]/50 rounded-xl flex flex-col items-center justify-center shadow-lg pointer-events-none z-10">
              <div className="absolute top-4 left-0 right-0 h-2.5 bg-gradient-to-r from-[#c29845] via-[#fbbf24] to-[#c29845] border-y border-yellow-200/20" />
              <div className="absolute bottom-0 right-4 w-6 h-11 bg-gradient-to-t from-[#c29845] to-[#fbbf24] rounded-t border border-yellow-200/30 shadow-md flex flex-col justify-around py-1">
                <div className="w-4 h-[1px] bg-black/40 mx-auto" />
                <div className="w-4 h-[1px] bg-black/40 mx-auto" />
              </div>
            </div>
            <svg className="absolute w-72 h-72 pointer-events-none stroke-primary/20 fill-none stroke-dashed" strokeWidth="1" strokeDasharray="3,3"><path d={kaabaD} /></svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {Array.from({ length: kaabaBeadsCount }).map((_, idx) => {
                const { x, y } = getKaabaPoint(idx);
                const isActive = idx === activeKaabaIdx;
                return (
                  <div key={idx} className="absolute w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-300" style={{ left: `calc(50% + ${x}px - 16px)`, top: `calc(50% + ${y}px - 16px)`, background: isActive ? 'radial-gradient(circle at 35% 35%, var(--accent-secondary) 0%, var(--primary) 70%, var(--primary-hover) 100%)' : 'radial-gradient(circle at 35% 35%, var(--bg-tertiary) 0%, var(--border-color) 70%, var(--text-muted) 100%)', boxShadow: isActive ? '0 0 16px var(--primary-glow), inset 0 2px 4px rgba(255,255,255,0.4)' : 'inset 0 1px 2px rgba(255,255,255,0.2)', border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`, transform: isActive ? 'scale(1.15)' : 'scale(1)', zIndex: isActive ? 5 : 1 }}>
                    <div className="absolute top-1.5 left-1.5 w-2 h-1 rounded-full bg-white/30 rotate-[-30deg]" />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeShape === 'star' && (
          <>
            <svg className="absolute w-72 h-72 pointer-events-none stroke-primary/20 fill-none stroke-dashed" strokeWidth="1" strokeDasharray="3,3"><path d={starD} /></svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {Array.from({ length: starBeadsCount }).map((_, idx) => {
                const { x, y } = getStarPoint(idx);
                const isActive = idx === activeStarIdx;
                return (
                  <div key={idx} className="absolute w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-300" style={{ left: `calc(50% + ${x}px - 16px)`, top: `calc(50% + ${y}px - 16px)`, background: isActive ? 'radial-gradient(circle at 35% 35%, var(--accent-secondary) 0%, var(--primary) 70%, var(--primary-hover) 100%)' : 'radial-gradient(circle at 35% 35%, var(--bg-tertiary) 0%, var(--border-color) 70%, var(--text-muted) 100%)', boxShadow: isActive ? '0 0 16px var(--primary-glow), inset 0 2px 4px rgba(255,255,255,0.4)' : 'inset 0 1px 2px rgba(255,255,255,0.2)', border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`, transform: isActive ? 'scale(1.15)' : 'scale(1)', zIndex: isActive ? 5 : 1 }}>
                    <div className="absolute top-1.5 left-1.5 w-2 h-1 rounded-full bg-white/30 rotate-[-30deg]" />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeShape === 'dome' && (
          <>
            <svg className="absolute w-72 h-72 pointer-events-none stroke-primary/20 fill-none stroke-dashed" strokeWidth="1" strokeDasharray="3,3"><path d={domeD} /></svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {Array.from({ length: domeBeadsCount }).map((_, idx) => {
                const { x, y } = getDomePoint(idx);
                const isActive = idx === activeDomeIdx;
                return (
                  <div key={idx} className="absolute w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-300" style={{ left: `calc(50% + ${x}px - 16px)`, top: `calc(50% + ${y}px - 16px)`, background: isActive ? 'radial-gradient(circle at 35% 35%, var(--accent-secondary) 0%, var(--primary) 70%, var(--primary-hover) 100%)' : 'radial-gradient(circle at 35% 35%, var(--bg-tertiary) 0%, var(--border-color) 70%, var(--text-muted) 100%)', boxShadow: isActive ? '0 0 16px var(--primary-glow), inset 0 2px 4px rgba(255,255,255,0.4)' : 'inset 0 1px 2px rgba(255,255,255,0.2)', border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`, transform: isActive ? 'scale(1.15)' : 'scale(1)', zIndex: isActive ? 5 : 1 }}>
                    <div className="absolute top-1.5 left-1.5 w-2 h-1 rounded-full bg-white/30 rotate-[-30deg]" />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeShape === 'kaaba' ? (
          <div className="absolute w-28 h-28 flex flex-col items-center justify-center pointer-events-none z-20 pt-6">
            <motion.span key={count} initial={{ scale: 0.85, opacity: 0.7 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.1 }} className="text-3xl font-extrabold tracking-tight text-[#fbbf24]">{count}</motion.span>
            <span className="text-[8px] font-bold text-yellow-200/50 uppercase tracking-widest mt-0.5">Target: {target}</span>
          </div>
        ) : (
          <div className="absolute w-32 h-32 rounded-full bg-bg-primary/95 border border-border-color shadow-inner flex flex-col items-center justify-center pointer-events-none z-0">
            <motion.span key={count} initial={{ scale: 0.85, opacity: 0.7 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.1 }} className="text-4xl font-extrabold tracking-tight text-text-primary">{count}</motion.span>
            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mt-1">Target: {target}</span>
          </div>
        )}
      </div>

      <div className="text-xs text-text-muted text-center pointer-events-none mt-2">Tap anywhere inside the box to log a count</div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-border-color/60 w-full justify-around">
        {[
          { key: 'circle', icon: Circle, label: 'Circle' },
          { key: 'crescent', icon: Moon, label: 'Hilal' },
          { key: 'kaaba', icon: Box, label: 'Kaaba' },
          { key: 'star', icon: Sun, label: 'Star' },
          { key: 'dome', icon: Compass, label: 'Dome' },
        ].map((s) => {
          const Icon = s.icon;
          const isSelected = activeShape === s.key;
          return (
            <button key={s.key} onClick={(e) => { e.stopPropagation(); setActiveShape(s.key as any); }} title={s.label} className={`p-2 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer flex-1 max-w-[56px] ${isSelected ? 'bg-primary/10 border border-primary/30 text-primary animate-in fade-in duration-200' : 'bg-bg-secondary/40 border border-transparent text-text-muted hover:text-text-secondary hover:bg-bg-primary/50'}`}>
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
