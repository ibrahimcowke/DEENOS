import React, { useEffect, useState } from 'react';
import { useDeenStore } from '../store/deenStore';
import { useHabitStore } from '../store/habitStore';
import { useUIStore } from '../store/uiStore';
import { DeenOrb } from '../components/DeenOrb';
import { TodayTimeline } from '../components/TodayTimeline';
import { geminiService } from '../services/gemini';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { t } = useTranslation();
  const { level, xp, getDeenScore, prayerLogs } = useDeenStore();
  const { habits } = useHabitStore();
  const { userProfile } = useUIStore();

  const [aiGuidance, setAiGuidance] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const deenScore = getDeenScore();

  // Load daily AI guidance reflections
  useEffect(() => {
    const fetchGuidance = async () => {
      setLoadingAi(true);
      const today = new Date().toISOString().split('T')[0];
      const completedToday = prayerLogs
        .filter(l => l.date === today && (l.status === 'completed' || l.status === 'outside' || l.status === 'mosque' || l.status === 'congregation'))
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
