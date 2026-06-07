import React from 'react';
import { motion } from 'framer-motion';
import { useHabitStore } from '../store/habitStore';
import type { Habit } from '../store/habitStore';
import { Droplet, Leaf, Sprout } from 'lucide-react';

interface SpiritualGardenProps {
  onLogComplete?: (id: string) => void;
}

export const SpiritualGarden: React.FC<SpiritualGardenProps> = ({ onLogComplete }) => {
  const { habits, getPlantLevel, getPlantStatus, logHabit } = useHabitStore();

  const handleWater = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    logHabit(habitId, 'completed', today);
    if (onLogComplete) onLogComplete(habitId);
  };

  // SVG drawing helpers for different plant types
  const renderPlantSVG = (habit: Habit) => {
    const level = getPlantLevel(habit); // 1 to 5
    const status = getPlantStatus(habit); // seedling, sprout, bud, blooming, wilted
    
    const isWilted = status === 'wilted';
    
    // Plant colors based on status
    const leafColor = isWilted ? '#a78bfa' : 'var(--primary)'; // wilted has an amethyst glow, healthy is primary green
    const accentColor = isWilted ? '#b45309' : 'var(--accent)';
    const stemColor = isWilted ? '#78716c' : '#059669';

    // Scale factor based on level
    const scale = 0.4 + (level * 0.15); // ranges from 0.55 to 1.15

    // Wind sway animation
    const swayVariant = {
      animate: {
        rotate: isWilted ? [0, 0] : [-2, 2, -2],
        transition: {
          duration: 3 + (habit.name.length % 3),
          repeat: Infinity,
          ease: "easeInOut" as const
        }
      }
    };

    switch (habit.plantType) {
      case 'tree': // Worship
        return (
          <motion.g variants={swayVariant} animate="animate" style={{ transformOrigin: '32px 56px', scale }}>
            {/* Trunk */}
            <path d="M29 35 L35 35 L35 56 L29 56 Z" fill={stemColor} />
            {/* Branches */}
            <path d="M26 38 L30 35 M38 38 L34 35" stroke={stemColor} strokeWidth="3" strokeLinecap="round" />
            {/* Foliage */}
            <circle cx="32" cy="24" r="16" fill={leafColor} opacity="0.9" />
            <circle cx="20" cy="22" r="12" fill={leafColor} opacity="0.8" />
            <circle cx="44" cy="22" r="12" fill={leafColor} opacity="0.8" />
            {/* Small glowing fruits if level is 5 */}
            {level === 5 && !isWilted && (
              <>
                <circle cx="26" cy="20" r="2.5" fill={accentColor} className="animate-pulse" />
                <circle cx="38" cy="18" r="2.5" fill={accentColor} className="animate-pulse" />
                <circle cx="32" cy="30" r="2.5" fill={accentColor} className="animate-pulse" />
              </>
            )}
          </motion.g>
        );
      case 'rose': // Family
      case 'flower': // General
        return (
          <motion.g variants={swayVariant} animate="animate" style={{ transformOrigin: '32px 56px', scale }}>
            {/* Stem */}
            <path d="M31 30 L33 30 L32 56" stroke={stemColor} strokeWidth="3.5" strokeLinecap="round" />
            {/* Leaves */}
            <path d="M25 42 Q30 38 32 44" fill={stemColor} />
            <path d="M39 40 Q34 36 32 42" fill={stemColor} />
            
            {/* Bloom state depending on status */}
            {status === 'seedling' && (
              <circle cx="32" cy="28" r="4" fill={stemColor} />
            )}
            {status === 'sprout' && (
              <path d="M28 26 Q32 18 36 26 Z" fill={leafColor} />
            )}
            {(status === 'bud' || status === 'blooming') && (
              <g>
                {/* Petals */}
                <circle cx="24" cy="24" r="7" fill={accentColor} opacity="0.8" />
                <circle cx="40" cy="24" r="7" fill={accentColor} opacity="0.8" />
                <circle cx="32" cy="16" r="7" fill={accentColor} opacity="0.8" />
                <circle cx="32" cy="32" r="7" fill={accentColor} opacity="0.8" />
                {/* Center */}
                <circle cx="32" cy="24" r="6.5" fill={isWilted ? '#78716c' : '#fbbf24'} />
              </g>
            )}
          </motion.g>
        );
      case 'cactus': // Finance
        return (
          <motion.g variants={swayVariant} animate="animate" style={{ transformOrigin: '32px 56px', scale }}>
            {/* Center cactus trunk */}
            <rect x="27" y="22" width="10" height="34" rx="5" fill={leafColor} />
            {/* Left arm */}
            <path d="M27 34 H20 V26 A3 3 0 0 1 26 26" fill={leafColor} />
            {/* Right arm */}
            <path d="M37 38 H44 V30 A3 3 0 0 0 38 30" fill={leafColor} />
            {/* Small flower on top if healthy */}
            {!isWilted && level >= 3 && (
              <circle cx="32" cy="20" r="3.5" fill={accentColor} />
            )}
          </motion.g>
        );
      case 'sunflower': // Health
        return (
          <motion.g variants={swayVariant} animate="animate" style={{ transformOrigin: '32px 56px', scale }}>
            {/* Tall stem */}
            <path d="M31 20 L33 20 L32 56" stroke={stemColor} strokeWidth="3" strokeLinecap="round" />
            {/* Large Sunflower head */}
            {status !== 'seedling' && (
              <g>
                {/* Petals backing */}
                <circle cx="32" cy="20" r="13" fill={isWilted ? '#b45309' : '#fbbf24'} />
                {/* Dark center seedbed */}
                <circle cx="32" cy="20" r="8" fill="#451a03" />
              </g>
            )}
            {status === 'seedling' && (
              <path d="M28 45 Q32 38 36 45" stroke={stemColor} strokeWidth="3" fill="none" />
            )}
          </motion.g>
        );
      case 'fern': // Learning
      default:
        return (
          <motion.g variants={swayVariant} animate="animate" style={{ transformOrigin: '32px 56px', scale }}>
            {/* Central stem */}
            <path d="M32 20 L32 56" stroke={stemColor} strokeWidth="2.5" />
            {/* Fronds radiating out */}
            <path d="M32 26 Q18 20 18 20 Q32 30 32 30" fill={leafColor} />
            <path d="M32 32 Q46 26 46 26 Q32 36 32 36" fill={leafColor} />
            <path d="M32 38 Q18 34 18 34 Q32 42 32 42" fill={leafColor} />
            <path d="M32 44 Q46 40 46 40 Q32 48 32 48" fill={leafColor} />
          </motion.g>
        );
    }
  };

  return (
    <div className="flex flex-col p-6 glass border border-border-color rounded-2xl w-full h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Sprout className="text-primary" size={20} />
            Spiritual Garden
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Grow beautiful plants by maintaining consistent habits
          </p>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="relative flex-1 bg-bg-tertiary/40 border border-border-color/60 rounded-xl p-4 overflow-y-auto min-h-[300px] flex items-center justify-center">
        {habits.length === 0 ? (
          <div className="text-center p-8 max-w-sm">
            <Leaf className="mx-auto text-text-muted mb-3 animate-bounce" size={32} />
            <p className="text-sm font-semibold text-text-primary">Your Garden is Empty</p>
            <p className="text-xs text-text-secondary mt-1">Create new habits to populate your garden grid!</p>
          </div>
        ) : (
          /* Isometric Garden Grid Layout */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-2xl px-2">
            {habits.map((habit) => {
              const status = getPlantStatus(habit);
              const isTodayDone = habit.lastCompletedDate === new Date().toISOString().split('T')[0];
              
              return (
                <div 
                  key={habit.id} 
                  className="flex flex-col items-center p-4 rounded-xl border border-border-color bg-bg-secondary/70 hover:bg-bg-secondary transition relative shadow-sm hover:shadow group"
                >
                  {/* SVG Illustration Container */}
                  <svg className="w-16 h-20 overflow-visible" viewBox="0 0 64 64">
                    {/* Dirt Mound pot */}
                    <ellipse cx="32" cy="56" rx="18" ry="6" fill="#7c2d12" opacity="0.8" />
                    <ellipse cx="32" cy="54" rx="14" ry="4" fill="#a16207" opacity="0.6" />
                    
                    {/* Dynamic plant renderer */}
                    {renderPlantSVG(habit)}
                  </svg>

                  {/* Habit Title */}
                  <div className="mt-3 text-center">
                    <span className="text-xs font-semibold text-text-primary block truncate max-w-[120px]">
                      {habit.name}
                    </span>
                    <span className="text-[10px] text-text-muted mt-0.5 block capitalize">
                      {habit.category} • {habit.currentStreak} 🔥
                    </span>
                  </div>

                  {/* Quick completion water button */}
                  <button
                    onClick={() => handleWater(habit.id)}
                    disabled={isTodayDone}
                    className={`mt-3 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold w-full transition border ${
                      isTodayDone
                        ? 'bg-success/10 border-success/20 text-success cursor-default'
                        : 'bg-primary border-primary hover:bg-primary-hover text-white hover:scale-105'
                    }`}
                  >
                    {isTodayDone ? (
                      <>
                        <Leaf size={12} />
                        Watered
                      </>
                    ) : (
                      <>
                        <Droplet size={12} />
                        Water
                      </>
                    )}
                  </button>

                  {/* Hover detail tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-text-primary text-bg-primary text-[10px] rounded px-2.5 py-1 z-20 whitespace-nowrap shadow pointer-events-none">
                    Status: <span className="font-bold capitalize">{status}</span> (Streak: {habit.currentStreak})
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default SpiritualGarden;
