import React, { useState } from 'react';
import { useDeenStore } from '../store/deenStore';
import { BookOpen, Sparkles, PlusCircle, Trophy, BookMarked, Trash2, Edit2, Check, X, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { quranSurahs } from '../lib/quranData';

export const QuranTracker: React.FC = () => {
  const { t } = useTranslation();
  const { quranProgress, updateQuranProgress, quranLogs, editQuranLog, deleteQuranLog } = useDeenStore();

  const [logMode, setLogMode] = useState<'pages' | 'ayahs'>('pages');
  const [pagesLog, setPagesLog] = useState<number>(1);
  const [ayahsLog, setAyahsLog] = useState<number>(10);
  const [surahLog, setSurahLog] = useState<number>(quranProgress.lastSurah);
  const [ayahLog, setAyahLog] = useState<number>(quranProgress.lastAyah);
  
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Inline editing states for logs
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(1);
  const [editSurah, setEditSurah] = useState<number>(1);
  const [editAyah, setEditAyah] = useState<number>(1);
  const [editMode, setEditMode] = useState<'pages' | 'ayahs'>('pages');
  const [editDate, setEditDate] = useState<string>('');

  const handleStartEdit = (log: any) => {
    setEditingLogId(log.id);
    setEditAmount(log.amount);
    setEditSurah(log.surah);
    setEditAyah(log.ayah);
    setEditMode(log.mode);
    setEditDate(log.date);
  };

  const handleSaveEdit = (id: string) => {
    editQuranLog(id, editAmount, editSurah, editAyah, editMode, editDate);
    setEditingLogId(null);
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
  };

  const handleSelectSurah = (surahNum: number) => {
    setSurahLog(surahNum);
    setAyahLog(1);
  };

  const handleLogProgress = (e: React.FormEvent) => {
    e.preventDefault();
    const logValue = logMode === 'pages' ? pagesLog : ayahsLog;
    updateQuranProgress(logValue, surahLog, ayahLog, logMode);
  };

  // Filter surahs
  const filteredSurahs = quranSurahs.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.num.toString() === searchQuery
  );

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
                    className="px-3 py-2 w-full border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary text-center text-text-primary"
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
                    className="px-3 py-2 w-full border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary text-center text-text-primary"
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
                className="px-3 py-2 w-full border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary text-center text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Last Ayah Number</label>
              <input
                type="number"
                min="1"
                value={ayahLog}
                onChange={(e) => setAyahLog(Math.max(1, parseInt(e.target.value) || 1))}
                className="px-3 py-2 w-full border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary text-center text-text-primary"
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

        {/* Right Column: AI Suggestions & Surah Reference */}
        <div className="flex flex-col gap-6">
          {/* AI Suggestions */}
          <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 flex flex-col justify-between h-full min-h-[165px]">
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

          {/* Quick Surah Reference List */}
          <div className="glass-card border border-border-color rounded-2xl p-5 bg-bg-secondary/40">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1.5">
              <BookOpen size={12} className="text-primary" />
              Quick Surah Reference
            </h3>
            
            {/* Search filter input */}
            <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Surah (e.g. Al-Kahf)..."
                className="w-full pl-8 pr-3 py-1.5 border border-border-color rounded-xl bg-bg-primary/50 text-[11px] focus:outline-none focus:border-primary text-text-primary"
              />
              <Search className="absolute left-2.5 top-2 text-text-muted" size={11} />
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {filteredSurahs.length > 0 ? (
                filteredSurahs.map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => handleSelectSurah(s.num)}
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-border-color bg-bg-primary/30 hover:bg-primary/5 hover:border-primary/20 text-left transition text-[11px] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-bg-tertiary flex items-center justify-center font-bold text-text-muted text-[10px]">
                        {s.num}
                      </span>
                      <div>
                        <span className="font-extrabold text-text-primary block">{s.name}</span>
                        <span className="text-[9px] text-text-muted">{s.type} • {s.verses} Ayat</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-primary font-bold hover:underline">Select</span>
                  </button>
                ))
              ) : (
                <div className="text-[10px] text-text-muted text-center py-4">No surah found.</div>
              )}
            </div>
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

      {/* Quran Logging History */}
      <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookMarked className="text-primary" size={20} />
            <h2 className="text-base font-bold text-text-primary">Quran progress logs</h2>
          </div>
        </div>

        {quranLogs && quranLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-color/60 text-[10px] text-text-muted uppercase font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Surah</th>
                  <th className="py-2.5 px-3">Last Ayah</th>
                  <th className="py-2.5 px-3">Progress</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color/40 text-xs">
                {[...quranLogs].reverse().map((log) => {
                  const isEditing = editingLogId === log.id;
                  const surahName = quranSurahs.find(s => s.num === log.surah)?.name || `Surah ${log.surah}`;
                  
                  return (
                    <tr key={log.id} className="hover:bg-bg-primary/20 transition">
                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="bg-bg-primary border border-border-color rounded px-2 py-1 text-xs text-text-primary w-28 focus:outline-none focus:border-primary"
                          />
                        ) : (
                          <span className="text-text-secondary">{log.date}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold">
                        {isEditing ? (
                          <select
                            value={editSurah}
                            onChange={(e) => setEditSurah(parseInt(e.target.value) || 1)}
                            className="bg-bg-primary border border-border-color rounded px-2 py-1 text-xs text-text-primary w-32 focus:outline-none focus:border-primary"
                          >
                            {quranSurahs.map(s => (
                              <option key={s.num} value={s.num}>
                                {s.num}. {s.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-text-primary">{log.surah}. {surahName}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            value={editAyah}
                            onChange={(e) => setEditAyah(Math.max(1, parseInt(e.target.value) || 1))}
                            className="bg-bg-primary border border-border-color rounded px-2 py-1 text-xs text-text-primary w-16 text-center focus:outline-none focus:border-primary"
                          />
                        ) : (
                          <span className="text-text-secondary">Ayah {log.ayah}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              value={editAmount}
                              onChange={(e) => setEditAmount(Math.max(1, parseInt(e.target.value) || 1))}
                              className="bg-bg-primary border border-border-color rounded px-2 py-1 text-xs text-text-primary w-16 text-center focus:outline-none focus:border-primary"
                            />
                            <select
                              value={editMode}
                              onChange={(e) => setEditMode(e.target.value as 'pages' | 'ayahs')}
                              className="bg-bg-primary border border-border-color rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-primary"
                            >
                              <option value="pages">Pages</option>
                              <option value="ayahs">Ayat</option>
                            </select>
                          </div>
                        ) : (
                          <span className="bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            {log.amount} {log.mode === 'pages' ? 'pages' : 'ayat'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveEdit(log.id)}
                              className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded cursor-pointer transition"
                              title="Save"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-text-muted hover:bg-bg-tertiary rounded cursor-pointer transition"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleStartEdit(log)}
                              className="p-1 text-text-muted hover:text-primary rounded hover:bg-primary/10 cursor-pointer transition"
                              title="Edit Log"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => deleteQuranLog(log.id)}
                              className="p-1 text-text-muted hover:text-danger rounded hover:bg-danger/10 cursor-pointer transition"
                              title="Delete Log"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-text-muted text-center py-6">No progress logs found. Log your progress above to begin!</p>
        )}
      </div>
    </div>
  );
};

export default QuranTracker;
