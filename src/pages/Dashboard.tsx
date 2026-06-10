import React, { useEffect, useState } from 'react';
import { useDeenStore } from '../store/deenStore';
import { useHabitStore } from '../store/habitStore';
import type { Habit } from '../store/habitStore';
import { useUIStore } from '../store/uiStore';
import { useFinanceStore } from '../store/financeStore';
import { DeenOrb } from '../components/DeenOrb';
import { TodayTimeline } from '../components/TodayTimeline';
import { geminiService } from '../services/gemini';
import { quranSurahs } from '../lib/quranData';
import { useCircleStore } from '../store/circleStore';
import { 
  Sparkles, ArrowRight, BookOpen, Award, X, 
  Droplet, Flame, TrendingUp, PlusCircle, Compass, Wallet, PenTool, Plus, 
  Activity, Check, ArrowUpRight, Users
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import confetti from 'canvas-confetti';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { t } = useTranslation();
  
  // Stores
  const { 
    level, xp, getDeenScore, prayerLogs, quranLogs, dhikrLogs, 
    achievements, quranProgress 
  } = useDeenStore();
  const { habits, getPlantLevel, getPlantStatus } = useHabitStore();
  const { userProfile } = useUIStore();
  const { expenses, zakatHistory } = useFinanceStore();

  // Component States
  const [aiGuidance, setAiGuidance] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showOrbDetails, setShowOrbDetails] = useState(false);

  const deenScore = getDeenScore();
  const today = new Date().toISOString().split('T')[0];

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs >= 4 && hrs < 6) return "Fajr blessings upon you";
    if (hrs >= 6 && hrs < 12) return "Assalamu Alaikum & Good Morning";
    if (hrs >= 12 && hrs < 15) return "Assalamu Alaikum & Good Afternoon";
    if (hrs >= 15 && hrs < 18) return "Peace be upon you (Asr window)";
    if (hrs >= 18 && hrs < 20) return "Good Evening (Maghrib window)";
    return "Peace be upon you this night";
  };

  // Load daily AI guidance reflections
  useEffect(() => {
    const fetchGuidance = async () => {
      setLoadingAi(true);
      const completedToday = prayerLogs
        .filter(l => l.date === today && (l.status !== 'missed' && l.status !== ''))
        .map(l => l.prayer_name);
      
      try {
        const text = await geminiService.getDailyGuidance(
          deenScore, 
          completedToday, 
          habits.filter(h => h.lastCompletedDate === today).length
        );
        setAiGuidance(text);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAi(false);
      }
    };
    fetchGuidance();
  }, [deenScore, prayerLogs, habits, today]);

  // Aggregate stats for Weekly Spiritual Analytics Chart
  const getScoreForDate = (dateString: string) => {
    const dayPrayers = prayerLogs.filter(l => l.date === dateString);
    const positiveSalahCount = dayPrayers.filter(l => l.status !== 'missed' && l.status !== '').length;
    const salahScore = Math.min(50, positiveSalahCount * 10);

    const dayDhikr = dhikrLogs.filter(l => l.date === dateString);
    const dhikrCount = dayDhikr.reduce((acc, log) => acc + log.count, 0);
    const dhikrScore = Math.min(20, Math.floor(dhikrCount / 5));

    const dayQuran = quranLogs.filter(l => l.date === dateString);
    const totalPagesRead = dayQuran.reduce((acc, log) => {
      const pages = log.mode === 'pages' ? log.amount : Math.max(1, Math.round(log.amount / 15));
      return acc + pages;
    }, 0);
    const quranScore = totalPagesRead > 0 ? 30 : 0;

    return Math.min(100, salahScore + dhikrScore + quranScore);
  };

  const getWeeklyData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const score = getScoreForDate(dateStr);
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
      data.push({
        name: dayLabel,
        score: score,
        prayers: prayerLogs.filter(l => l.date === dateStr && l.status !== 'missed' && l.status !== '').length,
      });
    }
    return data;
  };

  const chartData = getWeeklyData();

  // Botanical Plant Renderer
  const renderMiniPlant = (habit: Habit) => {
    const level = getPlantLevel(habit);
    const status = getPlantStatus(habit);
    const isWilted = status === 'wilted';
    
    const leafColor = isWilted ? '#a78bfa' : 'var(--primary)';
    const accentColor = isWilted ? '#b45309' : 'var(--accent)';
    const stemColor = isWilted ? '#78716c' : '#059669';
    const scale = 0.35 + (level * 0.12);

    switch (habit.plantType) {
      case 'tree':
        return (
          <g style={{ transformOrigin: '32px 56px', scale }}>
            <path d="M29 35 L35 35 L35 56 L29 56 Z" fill={stemColor} />
            <path d="M26 38 L30 35 M38 38 L34 35" stroke={stemColor} strokeWidth="2.5" />
            <circle cx="32" cy="24" r="14" fill={leafColor} opacity="0.95" />
            <circle cx="21" cy="22" r="10" fill={leafColor} opacity="0.85" />
            <circle cx="43" cy="22" r="10" fill={leafColor} opacity="0.85" />
          </g>
        );
      case 'rose':
      case 'flower':
        return (
          <g style={{ transformOrigin: '32px 56px', scale }}>
            <path d="M31 30 L33 30 L32 56" stroke={stemColor} strokeWidth="3" />
            {status === 'seedling' ? (
              <circle cx="32" cy="28" r="3.5" fill={stemColor} />
            ) : status === 'sprout' ? (
              <path d="M28 26 Q32 18 36 26 Z" fill={leafColor} />
            ) : (
              <g>
                <circle cx="25" cy="24" r="6" fill={accentColor} opacity="0.8" />
                <circle cx="39" cy="24" r="6" fill={accentColor} opacity="0.8" />
                <circle cx="32" cy="17" r="6" fill={accentColor} opacity="0.8" />
                <circle cx="32" cy="31" r="6" fill={accentColor} opacity="0.8" />
                <circle cx="32" cy="24" r="5" fill={isWilted ? '#78716c' : '#fbbf24'} />
              </g>
            )}
          </g>
        );
      case 'cactus':
        return (
          <g style={{ transformOrigin: '32px 56px', scale }}>
            <rect x="27" y="24" width="10" height="32" rx="4" fill={leafColor} />
            <path d="M27 35 H21 V28 A2.5 2.5 0 0 1 26 28" fill={leafColor} />
            <path d="M37 39 H43 V32 A2.5 2.5 0 0 0 38 32" fill={leafColor} />
          </g>
        );
      case 'sunflower':
        return (
          <g style={{ transformOrigin: '32px 56px', scale }}>
            <path d="M31 22 L33 22 L32 56" stroke={stemColor} strokeWidth="2.5" />
            {status !== 'seedling' ? (
              <g>
                <circle cx="32" cy="22" r="11" fill={isWilted ? '#b45309' : '#fbbf24'} />
                <circle cx="32" cy="22" r="7" fill="#451a03" />
              </g>
            ) : (
              <path d="M28 45 Q32 38 36 45" stroke={stemColor} strokeWidth="2.5" fill="none" />
            )}
          </g>
        );
      case 'fern':
      default:
        return (
          <g style={{ transformOrigin: '32px 56px', scale }}>
            <path d="M32 22 L32 56" stroke={stemColor} strokeWidth="2" />
            <path d="M32 28 Q18 22 18 22 Q32 32 32 32" fill={leafColor} />
            <path d="M32 34 Q46 28 46 28 Q32 38 32 38" fill={leafColor} />
            <path d="M32 40 Q18 36 18 36 Q32 44 32 44" fill={leafColor} />
          </g>
        );
    }
  };

  const obligatoryPrayers = [
    { key: 'fajr', label: 'Fajr' },
    { key: 'dhuhr', label: 'Dhuhr' },
    { key: 'asr', label: 'Asr' },
    { key: 'maghrib', label: 'Maghrib' },
    { key: 'isha', label: 'Isha' }
  ];

  const getPrayerStatus = (key: string) => {
    const log = prayerLogs.find(l => l.date === today && l.prayer_name === key);
    return log ? log.status : null;
  };

  const getPrayerColor = (status: string | null) => {
    if (!status) return 'bg-bg-tertiary/40 border-border-color/60 text-text-muted';
    switch (status) {
      case 'jamaah_mosque': return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-450';
      case 'individual_mosque': return 'bg-teal-500/20 border-teal-500/40 text-teal-450';
      case 'completed': return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
      case 'delayed': return 'bg-amber-500/20 border-amber-500/40 text-amber-500';
      case 'missed': return 'bg-red-500/20 border-red-500/40 text-red-500';
      default: return 'bg-bg-tertiary/40 border-border-color/60 text-text-secondary';
    }
  };

  const getPrayerLabel = (status: string | null) => {
    if (!status) return 'Not Logged';
    switch (status) {
      case 'jamaah_mosque': return 'Mosque (Jamaah)';
      case 'individual_mosque': return 'Mosque (Indiv)';
      case 'completed': return 'Home (Individual)';
      case 'delayed': return 'Delayed';
      case 'missed': return 'Missed';
      default: return 'Logged';
    }
  };

  const getPrayerIcon = (status: string | null) => {
    if (!status) return '⚪';
    switch (status) {
      case 'jamaah_mosque': return '🕌';
      case 'individual_mosque': return '👥';
      case 'completed': return '🏠';
      case 'delayed': return '⏳';
      case 'missed': return '❌';
      default: return '✓';
    }
  };

  // Activity Deck Stats Calculations
  // 1. Quran Read count
  const quranReadToday = quranLogs
    .filter(log => log.date === today)
    .reduce((acc, log) => {
      return acc + (log.mode === 'pages' ? log.amount : Math.max(1, Math.round(log.amount / 15)));
    }, 0);
  const lastSurahName = quranSurahs.find(s => s.num === quranProgress.lastSurah)?.name || `Surah ${quranProgress.lastSurah}`;

  // 2. Dhikr logs count
  const dhikrRecitedToday = dhikrLogs
    .filter(log => log.date === today)
    .reduce((acc, log) => acc + log.count, 0);
  const lastDhikrLog = dhikrLogs.length > 0 ? dhikrLogs[dhikrLogs.length - 1] : null;

  // 3. Charity spent
  const getCharityAmountThisMonth = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    return expenses
      .filter(exp => {
        if (exp.category !== 'charity') return false;
        const expDate = new Date(exp.date);
        return expDate.getFullYear() === currentYear && expDate.getMonth() === currentMonth;
      })
      .reduce((acc, exp) => acc + exp.amount, 0);
  };
  const charityMonthTotal = getCharityAmountThisMonth();

  // 4. Last journal entry
  const getLastJournalEntry = () => {
    try {
      const saved = localStorage.getItem('deenos_journal_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };
  const lastJournalEntry = getLastJournalEntry();

  // Hijri Date formatting
  const getHijriDate = () => {
    try {
      const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return formatter.format(new Date());
    } catch (e) {
      return "Dhu al-Hijjah 1447 AH";
    }
  };
  const hijriDate = getHijriDate();

  // Moon phase calculation
  const getMoonPhase = () => {
    const refDate = new Date('2000-01-06T18:14:00Z').getTime();
    const diffMs = Date.now() - refDate;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const moonAge = diffDays % 29.530588853;

    let phaseName = 'New Moon';
    let svgPath = '';

    if (moonAge < 1.84) {
      phaseName = 'New Moon';
      svgPath = 'M 32 8 A 24 24 0 0 0 32 56 A 24 24 0 0 0 32 8';
    } else if (moonAge < 5.53) {
      phaseName = 'Waxing Crescent';
      svgPath = 'M 32 8 A 24 24 0 0 1 32 56 A 20 24 0 0 0 32 8';
    } else if (moonAge < 9.22) {
      phaseName = 'First Quarter';
      svgPath = 'M 32 8 A 24 24 0 0 1 32 56 Z';
    } else if (moonAge < 12.91) {
      phaseName = 'Waxing Gibbous';
      svgPath = 'M 32 8 A 24 24 0 0 1 32 56 A 12 24 0 0 1 32 8 Z M 32 8 A 24 24 0 0 1 32 56 Z';
    } else if (moonAge < 16.61) {
      phaseName = 'Full Moon';
      svgPath = 'M 32 8 A 24 24 0 1 1 31.9 8';
    } else if (moonAge < 20.3) {
      phaseName = 'Waning Gibbous';
      svgPath = 'M 32 8 A 24 24 0 0 0 32 56 A 12 24 0 0 0 32 8 Z M 32 8 A 24 24 0 0 1 32 56 Z';
    } else if (moonAge < 23.99) {
      phaseName = 'Last Quarter';
      svgPath = 'M 32 8 A 24 24 0 0 0 32 56 Z';
    } else if (moonAge < 27.68) {
      phaseName = 'Waning Crescent';
      svgPath = 'M 32 8 A 24 24 0 0 0 32 56 A 20 24 0 0 1 32 8';
    } else {
      phaseName = 'New Moon';
      svgPath = 'M 32 8 A 24 24 0 0 0 32 56 A 24 24 0 0 0 32 8';
    }

    return { phaseName, svgPath };
  };
  const moon = getMoonPhase();

  // Circle store
  const { circles } = useCircleStore();
  const mainCircle = circles[0];

  return (
    <div className="space-y-6 select-none pb-12">
      {/* 1. TOP INTERACTIVE BRANDING & STREAK BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-accent/5 to-bg-secondary p-6 rounded-3xl border border-primary/25 shadow-lg group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial-gradient from-primary/10 to-transparent blur-3xl rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary animate-pulse" size={16} />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {getGreeting()}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight mt-2.5">
              Assalamu Alaikum, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{userProfile.fullName}</span>!
            </h2>
            <p className="text-xs text-text-secondary mt-1.5 max-w-xl leading-relaxed">
              Your daily operating dashboard. View spiritual stats, monitor your botanical habit garden, and track prayer logs in real-time. Use the Activity Deck below to jump to dedicated workspace tabs.
            </p>
          </div>

          {/* Consistency Streak Badge */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              confetti({ particleCount: 30, spread: 30, colors: ['#f59e0b', '#d97706'] });
            }}
            className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/35 text-amber-500 shadow-sm cursor-pointer relative overflow-hidden shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent animate-pulse-slow" />
            <Flame className="animate-bounce text-amber-500" size={24} />
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-black text-amber-600 tracking-wider">Consistency Streak</span>
              <span className="text-lg font-black text-amber-500">{useDeenStore.getState().dailyStreak} Active Days</span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* 2. CORE DASHBOARD GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* ================= COLUMN 1: INTERACTIVE DEENORB & GARDEN SUMMARY ================= */}
        <div className="space-y-6">
          {/* A. Clickable DeenOrb Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            onClick={() => {
              setShowOrbDetails(true);
              confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
            }}
            className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-2 right-3 text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Activity size={10} /> Click to Expand
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-2">Spiritual Energy Core</h3>
            
            <div className="hover:scale-[1.03] transition-transform duration-300 relative">
              <DeenOrb score={deenScore} level={level} xp={xp} xpNeeded={level * 1000} />
            </div>

            <p className="text-[10px] text-text-muted text-center mt-3 max-w-[220px]">
              Tap the center orb to view detailed score equations and unlockable spiritual badges.
            </p>
          </motion.div>

          {/* B. Spiritual Garden Summary Card */}
          <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-black text-text-primary tracking-tight">Interactive Garden</h3>
                <p className="text-[10px] text-text-secondary mt-0.5">Watch your habits blossom</p>
              </div>
              <button 
                onClick={() => setActiveTab('habits')}
                className="p-1 px-2.5 rounded bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition cursor-pointer flex items-center gap-1"
              >
                Go to Garden <ArrowUpRight size={10} />
              </button>
            </div>

            {habits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <PlusCircle size={20} />
                </div>
                <span className="text-xs font-bold text-text-primary">No habit seeds planted</span>
                <span className="text-[9px] text-text-muted mt-1 max-w-[180px]">Add habits in the Garden tab to watch trees and flowers grow.</span>
                <button
                  onClick={() => setActiveTab('habits')}
                  className="mt-3.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={11} /> Create Seedling
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {habits.slice(0, 4).map((habit) => {
                  const isWatered = habit.lastCompletedDate === today;
                  
                  return (
                    <div 
                      key={habit.id}
                      className="p-2.5 rounded-2xl border border-border-color bg-bg-secondary/50 flex flex-col items-center justify-between group relative"
                    >
                      {/* Botanical SVG */}
                      <svg className="w-12 h-14 overflow-visible" viewBox="0 0 64 64">
                        <ellipse cx="32" cy="56" rx="14" ry="4.5" fill="#7c2d12" opacity="0.8" />
                        {renderMiniPlant(habit)}
                      </svg>
                      
                      <div className="text-center mt-2 w-full">
                        <span className="text-[10px] font-bold text-text-primary block truncate max-w-full">
                          {habit.name}
                        </span>
                        <span className="text-[8px] text-text-muted mt-0.5 block uppercase font-bold tracking-wider">
                          Streak: {habit.currentStreak} 🔥
                        </span>
                      </div>

                      <div className={`mt-2 flex items-center justify-center gap-1 w-full py-1 rounded-lg text-[9px] font-bold border transition ${
                        isWatered 
                          ? 'bg-success/15 border-success/30 text-success' 
                          : 'bg-primary/5 border-primary/20 text-primary animate-pulse-slow'
                      }`}>
                        {isWatered ? (
                          <>
                            <Check size={10} /> Watered
                          </>
                        ) : (
                          <>
                            <Droplet size={10} /> Needs Water
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* C. Hijri Planner & Moon Phase Card */}
          <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40 flex flex-col justify-between relative overflow-hidden animate-pulse-slow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-amber-500/10 to-transparent blur-2xl rounded-full pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <h3 className="text-sm font-black text-text-primary tracking-tight">Lunar Calendar</h3>
                <p className="text-[10px] text-text-secondary mt-0.5">Hijri date & current moon phase</p>
              </div>
              <button 
                onClick={() => setActiveTab('ramadan')}
                className="p-1 px-2.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold hover:bg-amber-500/20 transition cursor-pointer flex items-center gap-1"
              >
                Open Planner <ArrowUpRight size={10} />
              </button>
            </div>

            <div className="flex items-center justify-between mt-1 relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-amber-500 tracking-wider">Islamic Date</span>
                <h4 className="text-base font-black text-text-primary tracking-tight">
                  {hijriDate}
                </h4>
                <p className="text-[10px] text-text-muted">
                  Phase: <span className="font-bold text-text-secondary">{moon.phaseName}</span>
                </p>
              </div>

              <div className="shrink-0 flex items-center justify-center relative">
                <div className="absolute w-14 h-14 bg-amber-500/10 rounded-full blur-md" />
                <svg className="w-14 h-14 drop-shadow-[0_0_10px_rgba(245,158,11,0.25)] relative z-10" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="24" fill="var(--bg-tertiary)" stroke="var(--border-color)" strokeWidth="1" />
                  <path d={moon.svgPath} fill="#f59e0b" opacity="0.95" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: AI GUIDANCE & AREA ANALYTICS CHART ================= */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* A. Gemini AI Daily Reflections Card */}
          <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-primary animate-pulse" size={20} />
                <h3 className="text-lg font-black text-text-primary tracking-tight">AI Daily reflections</h3>
              </div>
              
              <div className="space-y-3.5 text-xs leading-relaxed text-text-secondary overflow-y-auto max-h-[160px] pr-2">
                {loadingAi ? (
                  <div className="flex flex-col gap-2 py-8 items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] text-text-muted">{t('dashboard.generating_reflections')}</span>
                  </div>
                ) : (
                  aiGuidance ? (
                    aiGuidance.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={idx} className="font-extrabold text-xs text-primary uppercase tracking-widest mt-3 mb-1">{line.substring(4)}</h4>;
                      }
                      if (line.startsWith('* ') || line.startsWith('- ')) {
                        return <li key={idx} className="ml-3 list-disc my-0.5 text-text-secondary font-medium">{line.substring(2)}</li>;
                      }
                      if (line.startsWith('> ')) {
                        return <blockquote key={idx} className="border-l-2 border-primary pl-2.5 italic my-2 text-text-muted bg-primary/5 py-1 rounded-r">{line.substring(2)}</blockquote>;
                      }
                      return <p key={idx} className="font-medium">{line}</p>;
                    })
                  ) : (
                    <p className="italic text-text-muted text-center py-6">Reflections will show when activities are logged.</p>
                  )
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-5 pt-3 border-t border-border-color/40">
              <span className="text-[9px] font-bold text-text-muted">Powered by Gemini 2.5 Flash</span>
              <button 
                onClick={() => setActiveTab('ai-coach')}
                className="flex items-center gap-1 text-[10px] font-extrabold text-primary hover:underline cursor-pointer"
              >
                Open AI Coach Dialogues
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* B. Recharts Spiritual Analytics Chart */}
          <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-primary" size={20} />
                <h3 className="text-sm font-black text-text-primary tracking-tight">Weekly Spiritual consistency</h3>
              </div>
              <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                Weekly Deen Score Trends
              </span>
            </div>

            <div className="w-full h-64 ltr-only">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-muted)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={10} 
                    domain={[0, 100]} 
                    tickLine={false} 
                    axisLine={false} 
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--glass-bg)', 
                      borderColor: 'var(--border-color)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: 'var(--text-primary)',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    name="Deen Score"
                    stroke="var(--primary)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOWER DASHBOARD GRID: SALAH TRACKER checklist, ACTIVITY DECK & TIMELINE */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* COLUMN 1: SALAH TRACKER & COMMUNITY CIRCLES */}
        <div className="space-y-6">
          {/* A. SALAH TRACKER CHECKLIST WIDGET */}
          <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-black text-text-primary tracking-tight">Salah Tracker</h3>
                <p className="text-[10px] text-text-secondary mt-0.5">Today's completed prayers</p>
              </div>
              <button 
                onClick={() => setActiveTab('salah')}
                className="p-1 px-2.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition cursor-pointer flex items-center gap-1"
              >
                Open Tracker <ArrowUpRight size={10} />
              </button>
            </div>

            <div className="space-y-3">
              {obligatoryPrayers.map((p) => {
                const status = getPrayerStatus(p.key);
                const isLogged = !!status;
                
                return (
                  <div 
                    key={p.key} 
                    className={`flex items-center justify-between p-3 rounded-2xl border transition duration-200 ${
                      isLogged 
                        ? 'border-primary/20 bg-primary/[0.02]' 
                        : 'border-border-color bg-bg-secondary/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base select-none">{getPrayerIcon(status)}</span>
                      <span className="text-xs font-bold text-text-primary">{p.label}</span>
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded-xl border text-[9px] font-extrabold transition-all duration-300 ${getPrayerColor(status)}`}>
                      {getPrayerLabel(status)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* B. COMMUNITY CIRCLES WIDGET */}
          {mainCircle && (
            <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-primary/10 to-transparent blur-2xl rounded-full pointer-events-none" />
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <Users className="text-primary" size={18} />
                  <h3 className="text-sm font-black text-text-primary tracking-tight">Community Circles</h3>
                </div>
                <button 
                  onClick={() => setActiveTab('circles')}
                  className="p-1 px-2.5 rounded bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition cursor-pointer flex items-center gap-1"
                >
                  View Circles <ArrowUpRight size={10} />
                </button>
              </div>

              <div className="space-y-3.5 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-black text-text-muted tracking-wider">{mainCircle.name}</span>
                  <span className="text-[9px] bg-primary/15 border border-primary/20 text-primary font-bold px-1.5 py-0.5 rounded-md">
                    Khatm: {Math.round(mainCircle.sharedKhatmProgress)}%
                  </span>
                </div>

                <div className="space-y-2">
                  {mainCircle.members.slice(1, 4).map((member) => (
                    <div key={member.name} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-bg-secondary/30 border border-border-color/40">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{member.avatar}</span>
                        <span className="font-bold text-text-secondary truncate max-w-[100px]">{member.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="text-orange-500 animate-pulse-slow" size={13} />
                        <span className="font-black text-text-primary text-[10px]">{member.streak} Days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* B. SPIRITUAL FOCUS EXECUTIVE ACTIVITY DECK */}
        <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-text-primary tracking-tight mb-4">Spiritual Focus Deck</h3>
            
            <div className="grid grid-cols-2 gap-3.5">
              {/* Card 1: Quran */}
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('quran')}
                className="p-4 rounded-2xl border border-border-color/65 bg-bg-secondary/40 text-left flex flex-col justify-between h-[135px] cursor-pointer group relative overflow-hidden transition-all duration-200"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent blur-xl rounded-full" />
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-500">
                    <BookOpen size={18} />
                  </div>
                  <ArrowUpRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-blue-500 transition-all" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-blue-550">Quran Progress</span>
                  <h4 className="text-xs font-bold text-text-primary mt-1 truncate">
                    {lastSurahName}
                  </h4>
                  <p className="text-[9px] text-text-secondary mt-0.5">
                    Ayah {quranProgress.lastAyah} • {quranReadToday > 0 ? `${quranReadToday} pgs read` : 'No reading today'}
                  </p>
                </div>
              </motion.div>

              {/* Card 2: Dhikr */}
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('dhikr')}
                className="p-4 rounded-2xl border border-border-color/65 bg-bg-secondary/40 text-left flex flex-col justify-between h-[135px] cursor-pointer group relative overflow-hidden transition-all duration-200"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent blur-xl rounded-full" />
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
                    <Compass size={18} />
                  </div>
                  <ArrowUpRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-amber-500 transition-all" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-amber-550">Tasbih & Dhikr</span>
                  <h4 className="text-xs font-bold text-text-primary mt-1 truncate">
                    {lastDhikrLog ? lastDhikrLog.name : 'Recite Azkar'}
                  </h4>
                  <p className="text-[9px] text-text-secondary mt-0.5">
                    {dhikrRecitedToday} recited today {lastDhikrLog ? `• Last: ${lastDhikrLog.count}` : ''}
                  </p>
                </div>
              </motion.div>

              {/* Card 3: Sadaqah & Finance */}
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('finances')}
                className="p-4 rounded-2xl border border-border-color/65 bg-bg-secondary/40 text-left flex flex-col justify-between h-[135px] cursor-pointer group relative overflow-hidden transition-all duration-200"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent blur-xl rounded-full" />
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
                    <Wallet size={18} />
                  </div>
                  <ArrowUpRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-emerald-500 transition-all" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-emerald-550">Sadaqah Hub</span>
                  <h4 className="text-xs font-bold text-text-primary mt-1 truncate">
                    ${charityMonthTotal.toFixed(2)} spent
                  </h4>
                  <p className="text-[9px] text-text-secondary mt-0.5">
                    Charity this month {zakatHistory.length > 0 ? '• Zakat Paid' : ''}
                  </p>
                </div>
              </motion.div>

              {/* Card 4: Journal reflections */}
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('journal')}
                className="p-4 rounded-2xl border border-border-color/65 bg-bg-secondary/40 text-left flex flex-col justify-between h-[135px] cursor-pointer group relative overflow-hidden transition-all duration-200"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent blur-xl rounded-full" />
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-500">
                    <PenTool size={18} />
                  </div>
                  <ArrowUpRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-purple-500 transition-all" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-purple-550">Reflections</span>
                  <h4 className="text-xs font-bold text-text-primary mt-1 truncate">
                    {lastJournalEntry ? `${lastJournalEntry.mood} mood` : 'No Entry Today'}
                  </h4>
                  <p className="text-[9px] text-text-secondary mt-0.5 truncate max-w-full">
                    {lastJournalEntry ? lastJournalEntry.text : 'Reflect on your day'}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="mt-5 p-3.5 rounded-2xl bg-bg-tertiary/40 border border-border-color/60 flex items-center justify-between text-xs">
            <span className="font-semibold text-text-secondary">Global level status:</span>
            <span className="text-primary font-black">Level {level} ({xp} XP)</span>
          </div>
        </div>

        {/* C. DAILY TIMELINE PANEL */}
        <div>
          <TodayTimeline />
        </div>
      </div>

      {/* =========================================================================
         4. OVERLAYS & MODALS
         ========================================================================= */}

      {/* A. ORB DETAILS & ACHIEVEMENTS MODAL */}
      <AnimatePresence>
        {showOrbDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOrbDetails(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Content Card */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg glass border border-border-color rounded-3xl p-6 shadow-2xl relative z-10 bg-bg-secondary/90 text-left max-h-[85vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowOrbDetails(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 border-b border-border-color/65 pb-4 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Award size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-text-primary tracking-tight">Core Deen score equations</h3>
                  <p className="text-xs text-text-secondary">Current level: {level} • Total score: {deenScore}/100</p>
                </div>
              </div>

              {/* Equation breakdown */}
              <div className="space-y-3 mb-6 bg-bg-tertiary/40 border border-border-color/60 p-4 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-2">Score Equation Weightings</h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-text-primary">1. Salah logs completeness</span>
                  <span className="font-bold text-primary">Max 50 pts</span>
                </div>
                <div className="w-full h-1 bg-border-color rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-primary" style={{ width: '50%' }} />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-text-primary">2. Dhikr / Tasbih counts (Logged today)</span>
                  <span className="font-bold text-primary">Max 20 pts</span>
                </div>
                <div className="w-full h-1 bg-border-color rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-primary" style={{ width: '20%' }} />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-text-primary">3. Quran Pages logged today</span>
                  <span className="font-bold text-primary">Max 30 pts</span>
                </div>
                <div className="w-full h-1 bg-border-color rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '30%' }} />
                </div>
              </div>

              {/* Achievements Grid */}
              <div>
                <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-3.5">Spiritual achievements</h4>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((ach) => (
                    <div 
                      key={ach.id}
                      className={`p-3 rounded-2xl border flex items-start gap-3 shadow-sm transition-all ${
                        ach.unlocked 
                          ? 'bg-gradient-to-br from-primary/10 to-accent/5 border-primary/30' 
                          : 'bg-bg-tertiary/20 border-border-color/60 opacity-60'
                      }`}
                    >
                      <span className={`text-2xl filter ${ach.unlocked ? 'drop-shadow-sm' : 'grayscale'}`}>
                        {ach.badge}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-text-primary block truncate">{ach.name}</span>
                        <span className="text-[9px] text-text-secondary block mt-0.5 leading-snug">{ach.description}</span>
                        <span className="text-[8px] font-black text-primary uppercase block mt-1 tracking-wider">
                          {ach.unlocked ? '🏆 Unlocked' : `🔒 ${ach.xpReward} XP`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
