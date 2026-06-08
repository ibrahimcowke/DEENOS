import React, { useEffect, useState } from 'react';
import { useDeenStore } from '../store/deenStore';
import { useHabitStore } from '../store/habitStore';
import { useUIStore } from '../store/uiStore';
import { DeenOrb } from '../components/DeenOrb';
import { TodayTimeline } from '../components/TodayTimeline';
import { geminiService } from '../services/gemini';
import { Sparkles, ArrowRight, Zap, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { t } = useTranslation();
  const { level, xp, getDeenScore, prayerLogs, logPrayer, quranLogs, dhikrLogs } = useDeenStore();
  const { habits } = useHabitStore();
  const { userProfile } = useUIStore();

  const [aiGuidance, setAiGuidance] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [highPriorityGoals, setHighPriorityGoals] = useState<any[]>([]);

  const deenScore = getDeenScore();
  const today = new Date().toISOString().split('T')[0];

  // Fetch high priority goals from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('deenos_goals');
      if (saved) {
        const parsed = JSON.parse(saved);
        const high = parsed.filter((g: any) => g.priority === 'high');
        setHighPriorityGoals(high);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Load daily AI guidance reflections
  useEffect(() => {
    const fetchGuidance = async () => {
      setLoadingAi(true);
      const completedToday = prayerLogs
        .filter(l => l.date === today && (l.status.includes('completed') || l.status.includes('outside') || l.status.includes('mosque') || l.status.includes('congregation')))
        .map(l => l.prayer_name);
      
      try {
        const text = await geminiService.getDailyGuidance(deenScore, completedToday, habits.length);
        setAiGuidance(text);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAi(false);
      }
    };
    fetchGuidance();
  }, [deenScore, prayerLogs, habits.length]);

  const quickActions = [
    { label: t('dashboard.log_prayer'), tab: 'salah', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-500' },
    { label: t('dashboard.read_quran'), tab: 'quran', color: 'from-blue-500/20 to-indigo-500/20 text-blue-500' },
    { label: t('dashboard.add_dhikr'), tab: 'dhikr', color: 'from-amber-500/20 to-orange-500/20 text-amber-500' },
    { label: t('dashboard.add_habit'), tab: 'habits', color: 'from-green-500/20 to-emerald-500/20 text-green-500' },
    { label: t('dashboard.add_expense'), tab: 'finances', color: 'from-red-500/20 to-rose-500/20 text-red-500' },
    { label: t('dashboard.add_journal'), tab: 'journal', color: 'from-purple-500/20 to-pink-500/20 text-purple-500' }
  ];

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

  const handleQuickLogPrayer = (key: string) => {
    logPrayer(key, 'completed', today);
  };

  const hasReadQuranToday = quranLogs && quranLogs.some(l => l.date === today);
  const hasDoneDhikrToday = dhikrLogs && dhikrLogs.some(l => l.date === today);

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent p-6 rounded-2xl border border-primary/20">
        <div>
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            Assalamu Alaikum, {userProfile.fullName}!
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Welcome back to your spiritual operating space. Let's make today count for Dunya and Akhirah.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
          <Zap size={14} />
          <span>Daily streak: {useDeenStore.getState().dailyStreak} days</span>
        </div>
      </div>

      {/* Important Priorities & Reminders Section */}
      <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
          <Zap className="text-accent animate-pulse" size={14} />
          Important Focus & Daily Priorities
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Today's Prayers Checklist */}
          <div className="p-4 rounded-xl border border-border-color bg-bg-secondary/50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase block mb-3">Salah Checklist</span>
              <div className="space-y-2.5">
                {obligatoryPrayers.map((p) => {
                  const status = getPrayerStatus(p.key);
                  const isPrayed = status && status !== 'missed' && status !== '';
                  const isMissed = status === 'missed';
                  
                  return (
                    <div key={p.key} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-primary">{p.label}</span>
                      <div className="flex items-center gap-2">
                        {isPrayed ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Prayed
                          </span>
                        ) : isMissed ? (
                          <span className="text-red-500 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Missed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleQuickLogPrayer(p.key)}
                            className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-[10px] font-bold cursor-pointer transition"
                          >
                            Quick Log
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <button
              onClick={() => setActiveTab('salah')}
              className="text-[10px] text-primary font-bold hover:underline mt-4 text-left cursor-pointer"
            >
              Configure details (Mosque, Jama'ah) →
            </button>
          </div>

          {/* 2. Daily Quran & Dhikr progress */}
          <div className="p-4 rounded-xl border border-border-color bg-bg-secondary/50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase block mb-3">Daily Progress Check</span>
              
              <div className="space-y-4">
                {/* Quran Check */}
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hasReadQuranToday ? 'bg-emerald-500/10 text-emerald-450' : 'bg-amber-500/10 text-amber-450'}`}>
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-primary block">Quran Reading</span>
                    <span className="text-[10px] text-text-muted">
                      {hasReadQuranToday 
                        ? 'Logged Quran reading today!' 
                        : 'No pages logged today yet.'}
                    </span>
                  </div>
                </div>

                {/* Dhikr Check */}
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hasDoneDhikrToday ? 'bg-emerald-500/10 text-emerald-450' : 'bg-amber-500/10 text-amber-450'}`}>
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-primary block">Daily Dhikr / Tasbih</span>
                    <span className="text-[10px] text-text-muted">
                      {hasDoneDhikrToday 
                        ? 'Logged dhikr sessions today!' 
                        : 'No tasbih sessions logged today.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => setActiveTab('quran')}
                className="text-[10px] text-primary font-bold hover:underline cursor-pointer"
              >
                Log Quran
              </button>
              <button
                onClick={() => setActiveTab('dhikr')}
                className="text-[10px] text-primary font-bold hover:underline cursor-pointer"
              >
                Start Dhikr
              </button>
            </div>
          </div>

          {/* 3. Pinned High-Priority Goals */}
          <div className="p-4 rounded-xl border border-border-color bg-bg-secondary/50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase block mb-3">High Priority Milestones</span>
              
              <div className="space-y-3">
                {highPriorityGoals.length > 0 ? (
                  highPriorityGoals.slice(0, 2).map((g) => {
                    const completedSteps = g.roadmapCompleted?.filter(Boolean).length || 0;
                    const totalSteps = g.roadmap?.length || 0;
                    const pct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
                    
                    return (
                      <div key={g.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-text-primary truncate max-w-[140px]">{g.title}</span>
                          <span className="text-text-secondary font-bold">{pct}%</span>
                        </div>
                        <div className="w-full h-1 bg-border-color rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    No active high priority milestones pinned. Add milestones with high priority in the Goals tab.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('goals')}
              className="text-[10px] text-primary font-bold hover:underline mt-4 text-left cursor-pointer"
            >
              Go to goals tracker →
            </button>
          </div>
        </div>
      </div>

      {/* Main Core Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Animated Progress Orb Column */}
        <div className="glass-card border border-border-color rounded-2xl flex flex-col items-center justify-center p-6 bg-bg-secondary/40">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 text-center">Spiritual Orb</h3>
          <DeenOrb score={deenScore} level={level} xp={xp} xpNeeded={level * 1000} />
          <p className="text-[10px] text-text-muted text-center mt-3 max-w-[200px]">
            {t('dashboard.score_desc')}
          </p>
        </div>

        {/* Gemini AI Daily Guidance Column */}
        <div className="lg:col-span-2 glass-card border border-border-color rounded-2xl p-6 flex flex-col justify-between bg-bg-secondary/40">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-primary animate-pulse" size={20} />
              <h3 className="text-lg font-bold text-text-primary">{t('dashboard.ai_guidance_title')}</h3>
            </div>
            
            <div className="space-y-3 text-xs leading-relaxed text-text-secondary pr-2 overflow-y-auto max-h-[190px]">
              {loadingAi ? (
                <div className="flex flex-col gap-2 py-4 items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-text-muted mt-2">{t('dashboard.generating_reflections')}</span>
                </div>
              ) : (
                aiGuidance.split('\n').map((line, idx) => {
                  if (line.startsWith('### ')) {
                    return <h4 key={idx} className="font-extrabold text-sm text-primary my-1">{line.substring(4)}</h4>;
                  }
                  if (line.startsWith('* ') || line.startsWith('- ')) {
                    return <li key={idx} className="ml-3 list-disc my-0.5">{line.substring(2)}</li>;
                  }
                  if (line.startsWith('> ')) {
                    return <blockquote key={idx} className="border-l-2 border-primary pl-2 italic my-1 text-text-muted">{line.substring(2)}</blockquote>;
                  }
                  return <p key={idx}>{line}</p>;
                })
              )}
            </div>
          </div>
          
          <button 
            onClick={() => setActiveTab('ai-coach')}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline self-end mt-4 cursor-pointer"
          >
            Ask AI Coach
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Quick Actions & Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions panel */}
        <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 flex flex-col h-full">
          <h3 className="text-base font-bold text-text-primary mb-4">{t('dashboard.quick_actions')}</h3>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(action.tab)}
                className={`p-4 rounded-xl border border-transparent bg-gradient-to-tr ${action.color} font-bold text-xs text-center flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow hover:scale-[1.03] transition-all duration-200 cursor-pointer`}
              >
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Timeline panel */}
        <div className="lg:col-span-2">
          <TodayTimeline />
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
