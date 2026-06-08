import React, { useEffect, useState } from 'react';
import { useDeenStore } from '../store/deenStore';
import { useHabitStore } from '../store/habitStore';
import type { Habit } from '../store/habitStore';
import { useUIStore } from '../store/uiStore';
import { useFinanceStore } from '../store/financeStore';
import { DeenOrb } from '../components/DeenOrb';
import { TodayTimeline } from '../components/TodayTimeline';
import { geminiService } from '../services/gemini';
import { 
  Sparkles, ArrowRight, BookOpen, Award, X, 
  Droplet, Flame, TrendingUp, PlusCircle, Compass, Wallet, PenTool, Plus, 
  Activity, Check
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
    level, xp, getDeenScore, prayerLogs, logPrayer, quranLogs, dhikrLogs, 
    achievements, addXp, quranProgress, updateQuranProgress, logDhikr 
  } = useDeenStore();
  const { habits, getPlantLevel, getPlantStatus, logHabit } = useHabitStore();
  const { userProfile } = useUIStore();
  const { addExpense } = useFinanceStore();

  // Component States
  const [aiGuidance, setAiGuidance] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Modals & Popups
  const [activeModal, setActiveModal] = useState<'dhikr' | 'quran' | 'expense' | 'journal' | null>(null);
  const [showOrbDetails, setShowOrbDetails] = useState(false);
  const [activeSalahPop, setActiveSalahPop] = useState<string | null>(null);

  // Quick Action form states
  // 1. Tasbih counter
  const [tasbihPhrase, setTasbihPhrase] = useState('Subhan Allah');
  const [tasbihCount, setTasbihCount] = useState(0);
  const tasbihTarget = 33;
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // 2. Quran logger
  const [quranPages, setQuranPages] = useState<number>(2);
  const [quranSurah, setQuranSurah] = useState<number>(quranProgress.lastSurah || 1);
  const [quranAyah, setQuranAyah] = useState<number>(quranProgress.lastAyah || 1);

  // 3. Expense logger
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseCategory, setExpenseCategory] = useState<'food' | 'family' | 'education' | 'business' | 'charity' | 'entertainment' | 'bills' | 'custom'>('charity');
  const [expenseDesc, setExpenseDesc] = useState<string>('');

  // 4. Journal logger
  const [journalPrompt, setJournalPrompt] = useState<'gratitude' | 'challenges' | 'intentions'>('gratitude');
  const [journalText, setJournalText] = useState<string>('');
  const [journalMood, setJournalMood] = useState<string>('Blessed');

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
        const text = await geminiService.getDailyGuidance(deenScore, completedToday, habits.filter(h => h.lastCompletedDate === today).length);
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

  // Handlers for Quick Action Submits
  const handleQuickSalahLog = (prayerKey: string, status: string) => {
    logPrayer(prayerKey, status, today);
    setActiveSalahPop(null);
    if (status !== 'missed') {
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#10b981', '#34d399', '#fbbf24']
      });
    }
  };

  const handleWaterHabit = (habitId: string) => {
    logHabit(habitId, 'completed', today);
    confetti({
      particleCount: 40,
      spread: 30,
      origin: { y: 0.85 },
      colors: ['#3b82f6', '#60a5fa', '#10b981']
    });
  };

  // Digital Tasbih click
  const handleTasbihTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipples(prev => [...prev, { id: Date.now(), x, y }]);
    setTasbihCount(prev => {
      const next = prev + 1;
      if (next === tasbihTarget) {
        confetti({
          particleCount: 60,
          spread: 50,
          colors: ['#ca8a04', '#fbbf24', '#34d399']
        });
      }
      return next;
    });

    // Audio/Vibe feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const saveTasbihSession = () => {
    if (tasbihCount > 0) {
      logDhikr(tasbihPhrase, tasbihCount, today);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    setTasbihCount(0);
    setActiveModal(null);
  };

  const saveQuranProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (quranPages > 0) {
      updateQuranProgress(quranPages, quranSurah, quranAyah, 'pages');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      setActiveModal(null);
    }
  };

  const saveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount);
    if (!isNaN(amount) && amount > 0) {
      addExpense(amount, expenseCategory, expenseDesc || `${expenseCategory} expense`, today);
      confetti({
        particleCount: 60,
        spread: 40,
        origin: { y: 0.7 }
      });
      setExpenseAmount('');
      setExpenseDesc('');
      setActiveModal(null);
    }
  };

  const saveJournalEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    try {
      const promptText = journalPrompt === 'gratitude' ? t('journal.prompt_1') : 
                          journalPrompt === 'challenges' ? t('journal.prompt_2') : t('journal.prompt_3');
      
      const summaryText = await geminiService.analyzeJournalEntry(journalText, journalMood);

      const savedLogs = localStorage.getItem('deenos_journal_logs');
      const logs = savedLogs ? JSON.parse(savedLogs) : [];
      const newLog = {
        date: today,
        mood: journalMood,
        prompt: promptText,
        text: journalText,
        aiSummary: summaryText
      };
      localStorage.setItem('deenos_journal_logs', JSON.stringify([newLog, ...logs]));
      
      addXp(30);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      setJournalText('');
      setActiveModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Rendering isometric plant visualizers
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
    if (!status) return 'bg-bg-tertiary border-border-color text-text-muted hover:border-primary/50';
    switch (status) {
      case 'jamaah_mosque': return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-450';
      case 'individual_mosque': return 'bg-teal-500/20 border-teal-500/50 text-teal-450';
      case 'completed': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'delayed': return 'bg-amber-500/20 border-amber-500/50 text-amber-500';
      case 'missed': return 'bg-red-500/20 border-red-500/50 text-red-500';
      default: return 'bg-bg-tertiary border-border-color text-text-secondary';
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
              Your daily operating dashboard is reactive. Track Salah congregation values, update your botanical spiritual garden, click the DeenOrb to break down scores, and use inline modals to avoid screen switching.
            </p>
          </div>

          {/* Interactive Streak Badge */}
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
        
        {/* ================= COLUMN 1: INTERACTIVE DEENORB & MINI-GARDEN ================= */}
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

          {/* B. Interactive Mini-Garden Card */}
          <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-black text-text-primary tracking-tight">Interactive Garden</h3>
                <p className="text-[10px] text-text-secondary mt-0.5">Water active habits directly</p>
              </div>
              <button 
                onClick={() => setActiveTab('habits')}
                className="p-1 rounded bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition cursor-pointer"
              >
                Go to Garden
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

                      <button
                        onClick={() => handleWaterHabit(habit.id)}
                        disabled={isWatered}
                        className={`mt-2 flex items-center justify-center gap-1 w-full py-1 rounded-lg text-[9px] font-bold border transition ${
                          isWatered 
                            ? 'bg-success/15 border-success/30 text-success' 
                            : 'bg-primary text-white border-primary hover:bg-primary-hover hover:scale-102 cursor-pointer'
                        }`}
                      >
                        {isWatered ? (
                          <>
                            <Check size={10} /> Watered
                          </>
                        ) : (
                          <>
                            <Droplet size={10} /> Water
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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

      {/* 3. LOWER DASHBOARD GRID: SALAH LOGGER, QUICK ACTIONS & TODAY TIMELINE */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* A. INTERACTIVE SALAH LOGGER WIDGET */}
        <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-black text-text-primary tracking-tight">Salah Tracker</h3>
              <p className="text-[10px] text-text-secondary mt-0.5">Click any prayer to select details</p>
            </div>
            <button 
              onClick={() => setActiveTab('salah')}
              className="p-1 rounded bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition cursor-pointer"
            >
              Configure Logs
            </button>
          </div>

          <div className="space-y-2.5 relative">
            {obligatoryPrayers.map((p) => {
              const status = getPrayerStatus(p.key);
              
              return (
                <div key={p.key} className="relative">
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-border-color/80 bg-bg-secondary/40 hover:bg-bg-secondary/80 transition shadow-sm">
                    <span className="text-xs font-bold text-text-primary">{p.label}</span>
                    
                    <button
                      onClick={() => setActiveSalahPop(activeSalahPop === p.key ? null : p.key)}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-extrabold cursor-pointer transition-all ${getPrayerColor(status)}`}
                    >
                      {getPrayerLabel(status)}
                    </button>
                  </div>

                  {/* Popover Inline Select Sub-Menu */}
                  <AnimatePresence>
                    {activeSalahPop === p.key && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setActiveSalahPop(null)} 
                        />
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 top-full mt-1.5 bg-bg-secondary border border-border-color p-2 rounded-2xl shadow-xl z-50 flex flex-col gap-1 w-48 text-left"
                        >
                          <span className="text-[8px] font-extrabold text-text-muted uppercase px-2 py-0.5 block tracking-widest border-b border-border-color/60 pb-1.5 mb-1">
                            Prayer Status & XP Value
                          </span>
                          <button 
                            onClick={() => handleQuickSalahLog(p.key, 'jamaah_mosque')}
                            className="text-left text-[10px] font-bold px-2.5 py-1.5 hover:bg-emerald-500/10 rounded-xl hover:text-emerald-500 transition flex items-center justify-between"
                          >
                            <span>🕌 Mosque (Jama'ah)</span>
                            <span className="text-[8px] bg-emerald-500/20 px-1 py-0.5 rounded text-emerald-500 font-extrabold">+25 XP</span>
                          </button>
                          <button 
                            onClick={() => handleQuickSalahLog(p.key, 'individual_mosque')}
                            className="text-left text-[10px] font-bold px-2.5 py-1.5 hover:bg-teal-500/10 rounded-xl hover:text-teal-555 transition flex items-center justify-between"
                          >
                            <span>👥 Mosque (Individual)</span>
                            <span className="text-[8px] bg-teal-500/20 px-1 py-0.5 rounded text-teal-500 font-extrabold">+15 XP</span>
                          </button>
                          <button 
                            onClick={() => handleQuickSalahLog(p.key, 'completed')}
                            className="text-left text-[10px] font-bold px-2.5 py-1.5 hover:bg-blue-500/10 rounded-xl hover:text-blue-500 transition flex items-center justify-between"
                          >
                            <span>🏠 Home (Individual)</span>
                            <span className="text-[8px] bg-blue-500/20 px-1 py-0.5 rounded text-blue-500 font-extrabold">+15 XP</span>
                          </button>
                          <button 
                            onClick={() => handleQuickSalahLog(p.key, 'delayed')}
                            className="text-left text-[10px] font-bold px-2.5 py-1.5 hover:bg-amber-500/10 rounded-xl hover:text-amber-500 transition flex items-center justify-between"
                          >
                            <span>⏳ Delayed Salah</span>
                            <span className="text-[8px] bg-amber-500/20 px-1 py-0.5 rounded text-amber-500 font-extrabold">+5 XP</span>
                          </button>
                          <button 
                            onClick={() => handleQuickSalahLog(p.key, 'missed')}
                            className="text-left text-[10px] font-bold px-2.5 py-1.5 hover:bg-red-500/10 rounded-xl hover:text-red-555 transition flex items-center justify-between"
                          >
                            <span>❌ Missed Salah</span>
                            <span className="text-[8px] bg-red-500/20 px-1 py-0.5 rounded text-red-500 font-extrabold">+0 XP</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* B. QUICK ACTION CONTROL PANEL */}
        <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40 flex flex-col h-full justify-between">
          <div>
            <h3 className="text-sm font-black text-text-primary tracking-tight mb-4">Quick Action center</h3>
            
            <div className="grid grid-cols-2 gap-3.5">
              {/* 1. Dhikr Modal button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setTasbihCount(0);
                  setActiveModal('dhikr');
                }}
                className="p-4 rounded-2xl border border-transparent bg-gradient-to-br from-amber-500/15 to-orange-500/15 text-amber-500 font-bold text-xs text-center flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow hover:border-amber-500/25 transition-all duration-200 cursor-pointer"
              >
                <Compass size={20} />
                <span>Quick Tasbih</span>
              </motion.button>

              {/* 2. Quran Modal button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setQuranPages(2);
                  setActiveModal('quran');
                }}
                className="p-4 rounded-2xl border border-transparent bg-gradient-to-br from-blue-500/15 to-indigo-500/15 text-blue-500 font-bold text-xs text-center flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow hover:border-blue-500/25 transition-all duration-200 cursor-pointer"
              >
                <BookOpen size={20} />
                <span>Log Quran</span>
              </motion.button>

              {/* 3. Expense Modal button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setExpenseAmount('');
                  setExpenseDesc('');
                  setActiveModal('expense');
                }}
                className="p-4 rounded-2xl border border-transparent bg-gradient-to-br from-red-500/15 to-rose-500/15 text-red-500 font-bold text-xs text-center flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow hover:border-red-500/25 transition-all duration-200 cursor-pointer"
              >
                <Wallet size={20} />
                <span>Log Expense</span>
              </motion.button>

              {/* 4. Journal Modal button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setJournalText('');
                  setActiveModal('journal');
                }}
                className="p-4 rounded-2xl border border-transparent bg-gradient-to-br from-purple-500/15 to-pink-500/15 text-purple-500 font-bold text-xs text-center flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow hover:border-purple-500/25 transition-all duration-200 cursor-pointer"
              >
                <PenTool size={20} />
                <span>Daily Journal</span>
              </motion.button>
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

      {/* B. DETAILED DIGITAL TASBIH CLICKER MODAL */}
      <AnimatePresence>
        {activeModal === 'dhikr' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass border border-border-color rounded-3xl p-6 shadow-2xl relative z-10 bg-bg-secondary/90 text-left"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-border-color/65 pb-3 mb-4">
                <Compass className="text-amber-500" size={20} />
                <h3 className="text-base font-black text-text-primary">Digital Tasbih clicker</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Select Dhikr Phrase</label>
                  <select
                    value={tasbihPhrase}
                    onChange={(e) => {
                      setTasbihPhrase(e.target.value);
                      setTasbihCount(0);
                    }}
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="Subhan Allah">Subhan Allah (Glory be to Allah)</option>
                    <option value="Alhamdulillah">Alhamdulillah (Praise be to Allah)</option>
                    <option value="Allahu Akbar">Allahu Akbar (Allah is the Greatest)</option>
                    <option value="Astaghfirullah">Astaghfirullah (I seek forgiveness)</option>
                    <option value="La ilaha illa Allah">La ilaha illa Allah (No god but Allah)</option>
                  </select>
                </div>

                {/* Main digital counter button */}
                <div className="flex flex-col items-center py-6 justify-center">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Count Progress</span>
                  <span className="text-5xl font-black text-text-primary font-mono tracking-tighter mb-4">
                    {tasbihCount} <span className="text-xs text-text-muted font-normal">/ {tasbihTarget}</span>
                  </span>

                  {/* Circular button gemstone */}
                  <button
                    onClick={handleTasbihTap}
                    className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold shadow-lg relative overflow-hidden flex items-center justify-center scale-100 active:scale-95 transition-transform cursor-pointer border-4 border-white/20"
                  >
                    {/* Visual ripples */}
                    {ripples.map(r => (
                      <span 
                        key={r.id}
                        className="absolute w-6 h-6 rounded-full bg-white/30 animate-ping pointer-events-none"
                        style={{ left: r.x - 12, top: r.y - 12 }}
                      />
                    ))}
                    <span className="text-2xl font-black select-none">TAP</span>
                  </button>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setTasbihCount(0)}
                    className="flex-1 py-2 rounded-xl border border-border-color text-xs font-bold text-text-secondary hover:bg-bg-tertiary transition cursor-pointer"
                  >
                    Reset Count
                  </button>
                  <button
                    onClick={saveTasbihSession}
                    className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                  >
                    Save Session
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. QURAN LOG PROGRESS MODAL */}
      <AnimatePresence>
        {activeModal === 'quran' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass border border-border-color rounded-3xl p-6 shadow-2xl relative z-10 bg-bg-secondary/90 text-left"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-border-color/65 pb-3 mb-4">
                <BookOpen className="text-blue-500" size={20} />
                <h3 className="text-base font-black text-text-primary">Log Quran progress</h3>
              </div>

              <form onSubmit={saveQuranProgress} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Pages Read Today</label>
                  <input
                    type="number"
                    min="1"
                    value={quranPages}
                    onChange={(e) => setQuranPages(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Surah Number</label>
                    <input
                      type="number"
                      min="1"
                      max="114"
                      value={quranSurah}
                      onChange={(e) => setQuranSurah(Math.min(114, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Ayah Number</label>
                    <input
                      type="number"
                      min="1"
                      value={quranAyah}
                      onChange={(e) => setQuranAyah(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                  >
                    Save Progress Log (+{quranPages * 15} XP)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* D. EXPENSE QUICK LOGGER MODAL */}
      <AnimatePresence>
        {activeModal === 'expense' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass border border-border-color rounded-3xl p-6 shadow-2xl relative z-10 bg-bg-secondary/90 text-left"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-border-color/65 pb-3 mb-4">
                <Wallet className="text-red-500" size={20} />
                <h3 className="text-base font-black text-text-primary">Add Halal expense</h3>
              </div>

              <form onSubmit={saveExpense} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Amount ($ USD)</label>
                    <input
                      type="text"
                      placeholder="0.00"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Category</label>
                    <select
                      value={expenseCategory}
                      onChange={(e: any) => setExpenseCategory(e.target.value)}
                      className="w-full border border-border-color rounded-xl px-3 py-2.5 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary"
                    >
                      <option value="charity">Charity / Sadaqah</option>
                      <option value="food">Food & Drink</option>
                      <option value="family">Family & Home</option>
                      <option value="bills">Utility Bills</option>
                      <option value="education">Education</option>
                      <option value="business">Halal Business</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="custom">Custom Miscellaneous</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Mosque Charity donations"
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* E. GRATITUDE JOURNAL ENTRY MODAL */}
      <AnimatePresence>
        {activeModal === 'journal' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass border border-border-color rounded-3xl p-6 shadow-2xl relative z-10 bg-bg-secondary/90 text-left"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-border-color/65 pb-3 mb-4">
                <PenTool className="text-purple-500" size={20} />
                <h3 className="text-base font-black text-text-primary">Gratitude & Reflections</h3>
              </div>

              <form onSubmit={saveJournalEntry} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Reflection Prompt</label>
                  <select
                    value={journalPrompt}
                    onChange={(e: any) => setJournalPrompt(e.target.value)}
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="gratitude">Gratitude: What are you grateful for today?</option>
                    <option value="challenges">Challenges: What challenges did you face?</option>
                    <option value="intentions">Intentions: How can you make tomorrow better?</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Reflections</label>
                  <textarea
                    rows={4}
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Reflect sincerely on your day..."
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary resize-none leading-relaxed"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1.5">Your Mood State</label>
                  <div className="flex flex-wrap gap-2">
                    {['Blessed', 'Peaceful', 'Neutral', 'Anxious', 'Struggling'].map((m) => {
                      const emoji = m === 'Blessed' ? '😇' : m === 'Peaceful' ? '😌' : m === 'Neutral' ? '😐' : m === 'Anxious' ? '😟' : '💪';
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setJournalMood(m)}
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                            journalMood === m 
                              ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                              : 'bg-bg-primary border-border-color text-text-secondary hover:border-text-muted'
                          }`}
                        >
                          {emoji} {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                  >
                    Save Entry (+30 XP)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
