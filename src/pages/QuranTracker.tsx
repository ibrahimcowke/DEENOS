import React, { useState } from 'react';
import { useDeenStore } from '../store/deenStore';
import { BookOpen, Sparkles, PlusCircle, Trophy, BookMarked, Trash2, Edit2, Check, X, Search, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { quranSurahs } from '../lib/quranData';
import confetti from 'canvas-confetti';

export const QuranTracker: React.FC = () => {
  const { t } = useTranslation();
  const { quranProgress, updateQuranProgress, quranLogs, editQuranLog, deleteQuranLog, quranNotes, addQuranNote, editQuranNote, deleteQuranNote } = useDeenStore();

  const [logMode, setLogMode] = useState<'pages' | 'ayahs'>('pages');
  const [pagesLog, setPagesLog] = useState<number>(1);
  const [ayahsLog, setAyahsLog] = useState<number>(10);
  const [surahLog, setSurahLog] = useState<number>(quranProgress.lastSurah);
  const [ayahLog, setAyahLog] = useState<number>(quranProgress.lastAyah);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSurahDropdownOpen, setIsSurahDropdownOpen] = useState<boolean>(false);
  const [surahSearchText, setSurahSearchText] = useState<string>('');

  // Inline editing states for logs
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(1);
  const [editSurah, setEditSurah] = useState<number>(1);
  const [editAyah, setEditAyah] = useState<number>(1);
  const [editMode, setEditMode] = useState<'pages' | 'ayahs'>('pages');
  const [editDate, setEditDate] = useState<string>('');

  // Reflections/Notes states
  const [noteText, setNoteText] = useState<string>('');
  const [noteSurah, setNoteSurah] = useState<number>(quranProgress.lastSurah);
  const [noteAyah, setNoteAyah] = useState<number>(quranProgress.lastAyah);
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState<string>('');

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addQuranNote(noteSurah, noteAyah, noteText);
    setNoteText('');
    confetti({ particleCount: 30, spread: 30 });
  };

  const handleStartEditNote = (noteObj: any) => {
    setEditingNoteId(noteObj.id);
    setEditNoteText(noteObj.note);
  };

  const handleSaveEditNote = (id: string) => {
    if (!editNoteText.trim()) return;
    editQuranNote(id, editNoteText);
    setEditingNoteId(null);
  };

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
    // Reset amount read inputs for next session
    if (logMode === 'pages') setPagesLog(1);
    else setAyahsLog(10);
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
        <div className="lg:col-span-2 glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <BookOpen size={22} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-text-primary">{t('quran.tracker_title')}</h2>
                <p className="text-xs text-text-secondary mt-0.5">{t('quran.add_progress')}</p>
              </div>
            </div>
            
            {/* Mode Selection Toggle */}
            <div className="flex bg-bg-primary/80 border border-border-color p-0.5 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setLogMode('pages')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  logMode === 'pages'
                    ? 'bg-primary text-white shadow-sm'
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
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                By Ayat
              </button>
            </div>
          </div>

          <form onSubmit={handleLogProgress} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: Amount Read */}
              <div className="p-4 rounded-xl border border-border-color bg-bg-primary/20 space-y-2">
                <label className="text-xs font-bold text-text-secondary block uppercase tracking-wider">
                  {logMode === 'pages' ? 'Pages Read' : 'Ayat Read'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={logMode === 'pages' ? 604 : 6236}
                    value={logMode === 'pages' ? pagesLog : ayahsLog}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      if (logMode === 'pages') setPagesLog(val);
                      else setAyahsLog(val);
                    }}
                    className="w-full px-3 py-2 border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary text-center font-bold text-text-primary"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-text-muted">
                    {logMode === 'pages' ? 'pages' : 'ayat'}
                  </span>
                </div>
                <p className="text-[10px] text-text-muted">
                  {logMode === 'pages' 
                    ? `Rewards: +${pagesLog * 15} XP (${15} XP/pg)` 
                    : `Rewards: +${ayahsLog * 1} XP (${1} XP/ayah)`}
                </p>
              </div>

              {/* Column 2: Surah Searchable Selector */}
              <div className="p-4 rounded-xl border border-border-color bg-bg-primary/20 space-y-2 relative">
                <label className="text-xs font-bold text-text-secondary block uppercase tracking-wider">Surah Stopping Point</label>
                <button
                  type="button"
                  onClick={() => setIsSurahDropdownOpen(!isSurahDropdownOpen)}
                  className="w-full px-3 py-2 border border-border-color rounded-xl bg-bg-primary/50 text-sm text-left flex justify-between items-center text-text-primary cursor-pointer h-[38px] hover:border-text-muted transition"
                >
                  <span className="truncate font-semibold text-xs text-text-primary">
                    {surahLog}. {quranSurahs.find(s => s.num === surahLog)?.name || 'Select Surah'}
                  </span>
                  <ChevronDown size={14} className="text-text-muted" />
                </button>

                {isSurahDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsSurahDropdownOpen(false)} />
                    <div className="absolute z-40 left-3 right-3 mt-1 p-2 rounded-xl border border-border-color bg-bg-secondary/95 backdrop-blur-md shadow-xl flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search Surah..."
                          value={surahSearchText}
                          onChange={(e) => setSurahSearchText(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 border border-border-color rounded-lg bg-bg-primary text-xs focus:outline-none focus:border-primary text-text-primary"
                          autoFocus
                        />
                        <Search className="absolute left-2.5 top-2 text-text-muted" size={11} />
                      </div>
                      <div className="max-h-48 overflow-y-auto pr-1 space-y-1">
                        {quranSurahs
                          .filter(s => s.name.toLowerCase().includes(surahSearchText.toLowerCase()) || s.num.toString() === surahSearchText)
                          .map(s => (
                            <button
                              key={s.num}
                              type="button"
                              onClick={() => {
                                handleSelectSurah(s.num);
                                setIsSurahDropdownOpen(false);
                                setSurahSearchText('');
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer flex justify-between items-center ${
                                surahLog === s.num
                                  ? 'bg-primary/10 text-primary font-bold'
                                  : 'hover:bg-bg-primary/50 text-text-secondary'
                              }`}
                            >
                              <span>{s.num}. {s.name}</span>
                              <span className="text-[10px] text-text-muted">{s.verses} Ayat</span>
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  </>
                )}
                <p className="text-[10px] text-text-muted truncate">
                  {quranSurahs.find(s => s.num === surahLog)?.type} • {quranSurahs.find(s => s.num === surahLog)?.verses} Ayat total
                </p>
              </div>

              {/* Column 3: Ayah Input */}
              <div className="p-4 rounded-xl border border-border-color bg-bg-primary/20 space-y-2">
                <label className="text-xs font-bold text-text-secondary block uppercase tracking-wider">Ayah Stopping Point</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={quranSurahs.find(s => s.num === surahLog)?.verses || 286}
                    value={ayahLog}
                    onChange={(e) => {
                      const maxAyah = quranSurahs.find(s => s.num === surahLog)?.verses || 286;
                      setAyahLog(Math.max(1, Math.min(maxAyah, parseInt(e.target.value) || 1)));
                    }}
                    className="w-full px-3 py-2 border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary text-center font-bold text-text-primary"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-text-muted">
                    / {quranSurahs.find(s => s.num === surahLog)?.verses || 286}
                  </span>
                </div>
                <p className="text-[10px] text-text-muted">
                  Max verse limit is validated
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold transition hover:scale-[1.005] active:scale-[0.995] shadow-lg mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={15} />
              {logMode === 'pages'
                ? `Confirm Quran Log (+${pagesLog * 15} XP)`
                : `Confirm Quran Log (+${ayahsLog * 1} XP)`}
            </button>
          </form>

          {/* Quick reading stats block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border-color/60">
            {/* Last read position */}
            <div className="p-3.5 rounded-xl border border-primary/10 bg-primary/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/20">
                <BookMarked size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase block tracking-wider">Current Reading Position</span>
                <span className="text-sm font-extrabold text-text-primary block mt-0.5">
                  Surah {quranProgress.lastSurah}, Ayah {quranProgress.lastAyah}
                </span>
                <span className="text-[9px] text-text-muted block mt-0.5">
                  {quranSurahs.find(s => s.num === quranProgress.lastSurah)?.name}
                </span>
              </div>
            </div>

            {/* Total logged pages */}
            <div className="p-3.5 rounded-xl border border-accent/10 bg-accent/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent border border-accent/20">
                <Trophy size={18} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-extrabold">Total Progress logged</span>
                  <span className="text-[10px] font-extrabold text-primary">{Math.min(100, Math.round((quranProgress.pagesRead / 604) * 100))}% of Khatm</span>
                </div>
                <span className="text-sm font-extrabold text-text-primary block mt-0.5">
                  {quranProgress.pagesRead} <span className="text-xs font-semibold text-text-secondary">/ 604 pages</span>
                </span>
                <div className="w-full h-1.5 bg-border-color rounded-full overflow-hidden mt-1.5">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (quranProgress.pagesRead / 604) * 100)}%` }}
                  />
                </div>
              </div>
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
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              {t('quran.history_title')}
              <span className="bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                {quranLogs.length}
              </span>
            </h2>
          </div>
        </div>

        {quranLogs && quranLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-color/60 text-[10px] text-text-muted uppercase font-bold">
                  <th className="py-2.5 px-3">{t('quran.date')}</th>
                  <th className="py-2.5 px-3">{t('quran.surah')}</th>
                  <th className="py-2.5 px-3">{t('quran.last_ayah')}</th>
                  <th className="py-2.5 px-3">{t('quran.progress')}</th>
                  <th className="py-2.5 px-3 text-right">{t('quran.actions')}</th>
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
                          <span className="text-text-secondary font-medium">Ayah {log.ayah}</span>
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
          <p className="text-xs text-text-muted text-center py-6">{t('quran.no_logs')}</p>
        )}
      </div>

      {/* Quranic Reflections & Study Notes Section */}
      <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-6">
        <div className="flex items-center gap-2 border-b border-border-color/65 pb-3">
          <BookOpen className="text-primary" size={20} />
          <div>
            <h2 className="text-base font-bold text-text-primary">{t('enhancements.study_notes')}</h2>
            <p className="text-xs text-text-secondary mt-0.5">{t('enhancements.note_xp')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Write Note Form */}
          <div className="p-5 rounded-2xl border border-border-color bg-bg-secondary/60 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">{t('enhancements.add_reflection')}</h3>
            
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">Surah</label>
                  <select
                    value={noteSurah}
                    onChange={(e) => {
                      setNoteSurah(parseInt(e.target.value) || 1);
                      setNoteAyah(1);
                    }}
                    className="w-full bg-bg-primary border border-border-color rounded-xl px-2.5 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                  >
                    {quranSurahs.map(s => (
                      <option key={s.num} value={s.num}>
                        {s.num}. {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">Ayah</label>
                  <input
                    type="number"
                    min="1"
                    max={quranSurahs.find(s => s.num === noteSurah)?.verses || 286}
                    value={noteAyah}
                    onChange={(e) => {
                      const maxVerses = quranSurahs.find(s => s.num === noteSurah)?.verses || 286;
                      setNoteAyah(Math.max(1, Math.min(maxVerses, parseInt(e.target.value) || 1)));
                    }}
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">Reflection Text</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={t('enhancements.reflection_placeholder')}
                  rows={4}
                  className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
              >
                {t('enhancements.save_note')}
              </button>
            </form>
          </div>

          {/* Saved Notes List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">{t('enhancements.logged_reflections')}</h3>
            
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {quranNotes && quranNotes.length > 0 ? (
                [...quranNotes].reverse().map((nObj) => {
                  const surahName = quranSurahs.find(s => s.num === nObj.surah)?.name || `Surah ${nObj.surah}`;
                  const isEditingNote = editingNoteId === nObj.id;

                  return (
                    <div key={nObj.id} className="p-4 rounded-2xl border border-border-color bg-bg-secondary flex flex-col justify-between space-y-3 shadow-sm hover:border-primary/20 transition">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-text-primary">
                          Surah {nObj.surah}. {surahName}, Ayah {nObj.ayah}
                        </span>
                        <span className="text-[10px] text-text-muted">{nObj.date}</span>
                      </div>

                      {isEditingNote ? (
                        <div className="space-y-2">
                          <textarea
                            value={editNoteText}
                            onChange={(e) => setEditNoteText(e.target.value)}
                            rows={3}
                            className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary resize-none"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveEditNote(nObj.id)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-2.5 py-1.5 border border-border-color rounded-lg text-[10px] font-bold text-text-secondary hover:bg-bg-tertiary cursor-pointer transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-text-secondary leading-relaxed select-text font-medium bg-bg-primary/20 p-3 rounded-xl border border-border-color/40">
                          {nObj.note}
                        </p>
                      )}

                      {!isEditingNote && (
                        <div className="flex justify-end gap-2 border-t border-border-color/30 pt-2">
                          <button
                            onClick={() => handleStartEditNote(nObj)}
                            className="p-1 text-[10px] font-bold text-text-muted hover:text-primary transition cursor-pointer flex items-center gap-1"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => deleteQuranNote(nObj.id)}
                            className="p-1 text-[10px] font-bold text-text-muted hover:text-danger transition cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center border border-dashed border-border-color rounded-2xl">
                  <span className="text-xs text-text-muted font-bold block">No reflection notes recorded yet</span>
                  <span className="text-[10px] text-text-muted block mt-1">Select a verse and jot down your spiritual thoughts above.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranTracker;
