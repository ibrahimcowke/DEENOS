import React, { useState, useEffect } from 'react';
import { useJournalStore } from '../store/journalStore';
import { geminiService } from '../services/gemini';
import { PenTool, Sparkles, PlusCircle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const JournalPage: React.FC = () => {
  const { t } = useTranslation();

  const { logs, syncJournalData, addJournalEntry, deleteJournalEntry } = useJournalStore();

  useEffect(() => {
    syncJournalData();
  }, []);

  const [prompt, setPrompt] = useState<string>('gratitude');
  const [text, setText] = useState('');
  const [mood, setMood] = useState('Blessed');
  const [loadingAi, setLoadingAi] = useState(false);
  const [activeSummary, setActiveSummary] = useState('');

  const getMonthData = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed
    
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    const monthName = today.toLocaleString('default', { month: 'long' });
    
    return { year, month, startDayOfWeek, totalDays, monthName };
  };

  const formatDateString = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const getMoodForDay = (dateStr: string) => {
    const log = logs.find((l) => l.date === dateStr);
    return log ? log.mood : null;
  };

  const prompts = {
    gratitude: t('journal.prompt_1'),
    challenges: t('journal.prompt_2'),
    intentions: t('journal.prompt_3')
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoadingAi(true);
    const selectedPromptText = prompts[prompt as keyof typeof prompts] || '';

    try {
      const summaryText = await geminiService.analyzeJournalEntry(text, mood);
      setActiveSummary(summaryText);

      await addJournalEntry(mood, selectedPromptText, text, summaryText);
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const moods = [
    { name: 'Blessed', emoji: '😇' },
    { name: 'Peaceful', emoji: '😌' },
    { name: 'Neutral', emoji: '😐' },
    { name: 'Anxious', emoji: '😟' },
    { name: 'Struggling', emoji: '💪' }
  ];

  return (
    <div className="space-y-6">
      {/* Logger Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Editor Form */}
        <div className="lg:col-span-2 glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
          <div className="flex items-center gap-2 mb-6">
            <PenTool className="text-primary" size={24} />
            <div>
              <h2 className="text-xl font-bold tracking-tight text-text-primary">{t('journal.journal_title')}</h2>
              <p className="text-xs text-text-secondary mt-0.5">{t('journal.journal_subtitle')}</p>
            </div>
          </div>

          <form onSubmit={handleSaveEntry} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-text-secondary block mb-1">Select Reflection Prompt</label>
              <select
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full border border-border-color rounded-xl px-3 py-2.5 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
              >
                <option value="gratitude">Gratitude Prompt</option>
                <option value="challenges">Challenges & Obstacles</option>
                <option value="intentions">Intentions for Tomorrow</option>
              </select>
            </div>

            <div className="p-3.5 bg-bg-tertiary rounded-xl border border-border-color/60 text-xs font-semibold text-text-secondary">
              💡 {prompts[prompt as keyof typeof prompts]}
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-secondary block mb-1">Your Reflections</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder={t('journal.write_here')}
                className="w-full border border-border-color rounded-xl px-4 py-3 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary resize-none leading-relaxed"
                required
              />
            </div>

            {/* Mood selector row */}
            <div>
              <label className="text-[10px] font-bold text-text-secondary block mb-2">{t('journal.mood')}</label>
              <div className="flex flex-wrap gap-2">
                {moods.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setMood(m.name)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      mood === m.name
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-bg-secondary border-border-color text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAi}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow mt-2 cursor-pointer"
            >
              <PlusCircle size={14} />
              {loadingAi ? 'Analyzing Mindset...' : t('journal.submit_entry')}
            </button>
          </form>
        </div>

        {/* Right: AI Summary reflection */}
        <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-accent" size={18} />
              <h3 className="text-base font-bold text-text-primary">{t('journal.ai_summary_title')}</h3>
            </div>

            <div className="text-xs leading-relaxed text-text-secondary space-y-3 overflow-y-auto max-h-[260px] pr-1">
              {loadingAi ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-text-muted mt-2">Gemini is reflecting...</span>
                </div>
              ) : activeSummary ? (
                activeSummary.split('\n').map((line, idx) => {
                  if (line.startsWith('### ')) {
                    return <h4 key={idx} className="font-extrabold text-sm text-primary my-1">{line.substring(4)}</h4>;
                  }
                  if (line.startsWith('* ') || line.startsWith('- ')) {
                    return <li key={idx} className="ml-3 list-disc my-0.5">{line.substring(2)}</li>;
                  }
                  return <p key={idx}>{line}</p>;
                })
              ) : (
                <p className="text-text-muted italic">Save a journal entry to generate AI reflections.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics and Logs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Past Logs */}
        <div className="lg:col-span-7 glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-4">
          <h3 className="text-sm font-bold text-text-primary">Past Reflection Logs</h3>
          <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-12">No journal entries logged yet. Write your reflections above!</p>
            ) : (
              logs.map((log, idx) => (
                <div key={log.id || idx} className="p-4 rounded-xl border border-border-color bg-bg-secondary flex flex-col gap-2.5 shadow-sm relative group">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-primary">{log.date}</span>
                    <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-bold px-2 py-0.5 rounded-full mr-6">Mood: {log.mood}</span>
                  </div>
                  <div className="text-xs text-text-muted font-medium bg-bg-tertiary p-2 rounded">
                    Q: {log.prompt}
                  </div>
                  <p className="text-xs leading-relaxed text-text-secondary">{log.text}</p>
                  {log.aiSummary && (
                    <div className="border-t border-border-color/60 pt-2 text-[10px] text-primary font-semibold flex items-center gap-1.5">
                      <Sparkles size={11} />
                      <span>AI Reflection: {log.aiSummary.replace('### 📝 AI Mindset Summary\n', '')}</span>
                    </div>
                  )}
                  <button
                    onClick={() => deleteJournalEntry(log.id)}
                    className="absolute top-3 right-3 text-text-muted hover:text-danger rounded p-1 hover:bg-danger/10 transition opacity-0 group-hover:opacity-100 cursor-pointer animate-in fade-in"
                    title="Delete Entry"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Mood Analytics Grid */}
        <div className="lg:col-span-5 glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-5 shadow-lg">
          <div>
            <h3 className="text-sm font-bold text-text-primary capitalize">{getMonthData().monthName} Mood Grid</h3>
            <p className="text-[10px] text-text-secondary mt-0.5">Visualize your spiritual states and emotional mindset over the month</p>
          </div>

          {(() => {
            const { year, month, startDayOfWeek, totalDays } = getMonthData();
            const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            const emptySlots = Array.from({ length: startDayOfWeek });
            const monthDays = Array.from({ length: totalDays }, (_, i) => i + 1);

            const thisMonthLogs = logs.filter(l => l.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
            const blessedCount = thisMonthLogs.filter(l => l.mood === 'Blessed').length;
            const peacefulCount = thisMonthLogs.filter(l => l.mood === 'Peaceful').length;

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-1.5 text-center select-none">
                  {daysOfWeek.map((day, idx) => (
                    <span key={idx} className="text-[9px] font-extrabold text-text-muted uppercase py-0.5">
                      {day}
                    </span>
                  ))}
                  {emptySlots.map((_, idx) => (
                    <div key={`empty-${idx}`} className="aspect-square" />
                  ))}
                  {monthDays.map((d) => {
                    const dateStr = formatDateString(year, month, d);
                    const moodForDay = getMoodForDay(dateStr);
                    
                    const getMoodStyle = (m: string | null) => {
                      if (!m) return 'border border-border-color/60 text-text-muted/40 hover:bg-bg-primary/50';
                      switch (m) {
                        case 'Blessed':
                          return 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 font-extrabold shadow-sm';
                        case 'Peaceful':
                          return 'bg-teal-500/20 border border-teal-500/40 text-teal-500 font-extrabold shadow-sm';
                        case 'Neutral':
                          return 'bg-amber-500/20 border border-amber-500/40 text-amber-500 font-extrabold shadow-sm';
                        case 'Anxious':
                          return 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-500 font-extrabold shadow-sm';
                        case 'Struggling':
                          return 'bg-rose-500/20 border border-rose-500/40 text-rose-500 font-extrabold shadow-sm';
                        default:
                          return 'border border-border-color text-text-muted';
                      }
                    };

                    const getMoodEmoji = (m: string | null) => {
                      if (!m) return null;
                      const found = moods.find((item) => item.name === m);
                      return found ? found.emoji : null;
                    };

                    return (
                      <div
                        key={d}
                        title={moodForDay ? `Day ${d}: ${moodForDay}` : `Day ${d}`}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] transition relative group ${getMoodStyle(moodForDay)}`}
                      >
                        <span className="text-[8px] font-bold opacity-50 absolute top-0.5 left-1">{d}</span>
                        <span className="text-xs mt-1.5">{getMoodEmoji(moodForDay)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2 justify-center pt-3 border-t border-border-color/60 text-[9px] font-bold text-text-muted uppercase">
                  {moods.map((m) => (
                    <div key={m.name} className="flex items-center gap-1">
                      <span className="text-xs">{m.emoji}</span>
                      <span>{m.name}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-[10px] text-text-secondary bg-bg-primary/20 p-3 rounded-xl border border-border-color/60 flex justify-between items-center font-bold">
                  <span>Monthly Stats:</span>
                  <span className="text-primary">{thisMonthLogs.length} EntriesLogged • {blessedCount + peacefulCount} PositiveDays</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
export default JournalPage;
