import React, { useState } from 'react';
import { useDeenStore } from '../store/deenStore';
import { BookOpen, Sparkles, PlusCircle, Trophy, BookMarked } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const QuranTracker: React.FC = () => {
  const { t } = useTranslation();
  const { quranProgress, updateQuranProgress } = useDeenStore();

  const [logMode, setLogMode] = useState<'pages' | 'ayahs'>('pages');
  const [pagesLog, setPagesLog] = useState<number>(1);
  const [ayahsLog, setAyahsLog] = useState<number>(10);
  const [surahLog, setSurahLog] = useState<number>(quranProgress.lastSurah);
  const [ayahLog, setAyahLog] = useState<number>(quranProgress.lastAyah);

  const handleLogProgress = (e: React.FormEvent) => {
    e.preventDefault();
    const logValue = logMode === 'pages' ? pagesLog : ayahsLog;
    updateQuranProgress(logValue, surahLog, ayahLog, logMode);
  };

  // Mock Quran Goals representation
  const quranGoals = [
    { title: 'Khatm Al-Quran (Finish Quran)', target: '604 pages', progress: `${quranProgress.pagesRead}/604 pgs`, percentage: Math.min(100, Math.round((quranProgress.pagesRead / 604) * 100)) },
    { title: 'Memorize Juz Amma', target: '37 surahs', progress: '12/37 surahs', percentage: 32 }
  ];

  return (
    <div className="space-y-6">
      {/* Tracker Logger Form Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Logger Form */}
        <div className="lg:col-span-2 glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="text-primary" size={24} />
              <div>
                <h2 className="text-xl font-bold tracking-tight text-text-primary">{t('quran.tracker_title')}</h2>
                <p className="text-xs text-text-secondary mt-0.5">{t('quran.add_progress')}</p>
              </div>
            </div>
            
            {/* Mode Selection Toggle */}
            <div className="flex bg-bg-primary/80 border border-border-color p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setLogMode('pages')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  logMode === 'pages'
                    ? 'bg-primary text-white shadow'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                By Pages
              </button>
              <button
                type="button"
                onClick={() => setLogMode('ayahs')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  logMode === 'ayahs'
                    ? 'bg-primary text-white shadow'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                By Ayat
              </button>
            </div>
          </div>

          <form onSubmit={handleLogProgress} className="grid grid-cols-3 gap-4">
            <div>
              {logMode === 'pages' ? (
                <>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Pages Read</label>
                  <input
                    type="number"
                    min="1"
                    max="604"
                    value={pagesLog}
                    onChange={(e) => setPagesLog(Math.max(1, parseInt(e.target.value) || 1))}
                    className="px-3 py-2 w-full border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary text-center"
                  />
                </>
              ) : (
                <>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Ayat Read</label>
                  <input
                    type="number"
                    min="1"
                    value={ayahsLog}
                    onChange={(e) => setAyahsLog(Math.max(1, parseInt(e.target.value) || 1))}
                    className="px-3 py-2 w-full border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary text-center"
                  />
                </>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Last Surah Number</label>
              <input
                type="number"
                min="1"
                max="114"
                value={surahLog}
                onChange={(e) => setSurahLog(Math.max(1, Math.min(114, parseInt(e.target.value) || 1)))}
                className="px-3 py-2 w-full border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary text-center"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Last Ayah Number</label>
              <input
                type="number"
                min="1"
                value={ayahLog}
                onChange={(e) => setAyahLog(Math.max(1, parseInt(e.target.value) || 1))}
                className="px-3 py-2 w-full border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary text-center"
              />
            </div>

            <button
              type="submit"
              className="col-span-3 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition hover:scale-[1.01] shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={14} />
              {logMode === 'pages'
                ? `Log Quran Progress (+${pagesLog * 15} XP / 15 XP per Page)`
                : `Log Quran Progress (+${ayahsLog * 1} XP / 1 XP per Ayah)`}
            </button>
          </form>

          {/* Current reading status widget */}
          <div className="mt-6 p-4 rounded-xl border border-border-color bg-bg-primary/40 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <BookMarked size={16} className="text-primary" />
              <div>
                <span className="font-bold text-text-primary block">Current Position</span>
                <span className="text-[10px] text-text-muted mt-0.5 block">Surah {quranProgress.lastSurah}, Ayah {quranProgress.lastAyah}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-text-primary block">Total Pages Logged</span>
              <span className="text-[10px] text-primary font-extrabold mt-0.5 block">{quranProgress.pagesRead} pages</span>
            </div>
          </div>
        </div>

        {/* Right: AI Quran Suggestions */}
        <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-accent" size={20} />
              <h3 className="text-base font-bold text-text-primary">{t('quran.ai_coach_title')}</h3>
            </div>
            
            <p className="text-xs text-text-secondary leading-relaxed bg-accent/5 p-4 rounded-xl border border-accent/10">
              {t('quran.ai_suggestion_placeholder')}
            </p>
          </div>

          <div className="mt-4 border-t border-border-color/60 pt-4 text-[10px] text-text-muted">
            Suggestions are updated daily depending on your active reading velocity.
          </div>
        </div>
      </div>

      {/* Reading Goals Progress Card */}
      <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="text-primary" size={20} />
          <h2 className="text-base font-bold text-text-primary">{t('quran.quran_goals')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quranGoals.map((goal, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-border-color bg-bg-secondary/70 shadow-sm">
              <div className="flex justify-between items-center text-xs mb-3">
                <span className="font-bold text-text-primary">{goal.title}</span>
                <span className="text-text-secondary">{goal.progress}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-border-color overflow-hidden mb-1">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500" 
                  style={{ width: `${goal.percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-text-muted font-semibold">{goal.percentage}% Complete</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default QuranTracker;
