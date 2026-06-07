import React from 'react';
import { motion } from 'framer-motion';

interface DeenOrbProps {
  score: number;
  level: number;
  xp: number;
  xpNeeded: number;
}

export const DeenOrb: React.FC<DeenOrbProps> = ({ score, level, xp, xpNeeded }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const xpPercentage = Math.min(100, (xp / xpNeeded) * 100);

  return (
    <div className="relative flex flex-col items-center justify-center p-6 select-none">
      {/* Orb Outer Rings Wrapper */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Glow backdrop */}
        <div 
          className="absolute w-48 h-48 rounded-full blur-3xl opacity-30 transition-all duration-700"
          style={{
            background: 'radial-gradient(circle, var(--primary) 0%, var(--accent) 100%)',
          }}
        />

        {/* Pulsating Glassmorphic Circle */}
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
            rotate: [0, 360],
          }}
          transition={{
            scale: { repeat: Infinity, duration: 4, ease: "easeInOut" },
            rotate: { repeat: Infinity, duration: 40, ease: "linear" }
          }}
          className="absolute w-44 h-44 rounded-full glass border border-[var(--glass-border)] shadow-inner flex items-center justify-center"
        >
          {/* Subtle spinning internal gradient ring */}
          <div className="absolute inset-2 rounded-full border border-dashed border-primary/20 animate-spin-slow" />
        </motion.div>

        {/* Static Content Overlay */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="text-4xl font-extrabold tracking-tight text-text-primary"
          >
            {score}
          </motion.span>
          <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold mt-1">
            Deen Score
          </span>
          
          {/* Small XP badge inside */}
          <div className="mt-2 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary">
            Lvl {level}
          </div>
        </div>

        {/* SVG Progress Rings */}
        <svg className="w-full h-full -rotate-90">
          {/* Shadow track */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            className="stroke-border-color fill-none"
            strokeWidth="8"
          />
          {/* Glowing dynamic track */}
          <motion.circle
            cx="128"
            cy="128"
            r={radius}
            className="stroke-primary fill-none"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>

        {/* Particle nodes around the orb based on score */}
        {[...Array(6)].map((_, i) => {
          const angle = (i * 60 * Math.PI) / 180;
          const x = 128 + (radius + 12) * Math.cos(angle);
          const y = 128 + (radius + 12) * Math.sin(angle);
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: x - 4,
                top: y - 4,
                background: i % 2 === 0 ? 'var(--primary)' : 'var(--accent)',
                boxShadow: '0 0 8px var(--primary)',
              }}
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2 + i,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* Mini XP Status Bar underneath */}
      <div className="w-56 mt-4 flex flex-col items-center">
        <div className="flex justify-between w-full text-[11px] text-text-secondary font-medium px-1 mb-1">
          <span>{xp} XP</span>
          <span>{xpNeeded} XP to Lvl {level + 1}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-border-color overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-accent"
          />
        </div>
      </div>
    </div>
  );
};
export default DeenOrb;
