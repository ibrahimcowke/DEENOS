import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/gemini';
import { Send, AlertTriangle, User, Compass, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AICoachChat: React.FC = () => {
  const [coachMode, setCoachMode] = useState<'deen' | 'productivity' | 'habit' | 'quran' | 'finance'>('deen');
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    deen: [
      { role: 'assistant', content: "Assalamu Alaikum! I am your Deen Coach. I am here to help you integrate salah, dhikr, and daily worship routines into your busy life. What spiritual habit are you focusing on today?" }
    ],
    productivity: [
      { role: 'assistant', content: "Assalamu Alaikum! I am your Productivity Coach. Let's optimize your schedules, leverage early morning Barakah (after Fajr), and align your daily ambitions. How can I assist your planning?" }
    ],
    habit: [
      { role: 'assistant', content: "Assalamu Alaikum! I am your Habit Coach. Together, we'll design a healthy routine to cultivate your Spiritual Garden. What habit would you like to grow?" }
    ],
    quran: [
      { role: 'assistant', content: "Assalamu Alaikum! I am your Quran Coach. Let's design reading roadmaps, set juz benchmarks, and plan surah memorization. What is your current reading goal?" }
    ],
    finance: [
      { role: 'assistant', content: "Assalamu Alaikum! I am your Financial Coach. I can help you analyze subscription budgets, structure Sadaqah payouts, and calculate annual Zakat details. What finance item is on your mind?" }
    ]
  });

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeMessages = messages[coachMode];

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: inputVal };
    const updatedMessages = [...activeMessages, userMessage];
    
    // Optimistic update
    setMessages({
      ...messages,
      [coachMode]: updatedMessages
    });
    setInputVal('');
    setLoading(true);

    try {
      // Call Gemini or Local Fallback
      const responseText = await geminiService.askCoach(coachMode, updatedMessages);
      
      setMessages(prev => ({
        ...prev,
        [coachMode]: [...prev[coachMode], { role: 'assistant', content: responseText }]
      }));
    } catch (err) {
      console.error(err);
      setMessages(prev => ({
        ...prev,
        [coachMode]: [...prev[coachMode], { role: 'assistant', content: "I apologize, my system encountered an error connecting to Gemini. Please try again shortly." }]
      }));
    } finally {
      setLoading(false);
    }
  };

  const coachModes = [
    { id: 'deen', label: 'Deen Coach', emoji: '🕌' },
    { id: 'productivity', label: 'Productivity', emoji: '⚡' },
    { id: 'habit', label: 'Habit Garden', emoji: '🌿' },
    { id: 'quran', label: 'Quran Coach', emoji: '📖' },
    { id: 'finance', label: 'Finance Hub', emoji: '💰' }
  ] as const;

  return (
    <div className="flex flex-col h-[550px] border border-border-color rounded-2xl glass-card overflow-hidden shadow-lg">
      {/* Disclaimer Banner */}
      <div className="bg-warning/10 border-b border-warning/20 p-2.5 px-4 flex items-start gap-2">
        <AlertTriangle className="text-warning shrink-0 mt-0.5" size={14} />
        <p className="text-[10px] leading-relaxed text-text-secondary font-medium">
          <strong>Islamic Guidance Disclaimer:</strong> This AI assistant utilizes Gemini to suggest daily reflections and productivity guidelines. For official jurisprudence queries or formal fatwas, please consult a certified Islamic scholar.
        </p>
      </div>

      {/* Coach selector tabs */}
      <div className="flex border-b border-border-color overflow-x-auto bg-bg-tertiary/50 p-2 gap-1.5 shrink-0">
        {coachModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setCoachMode(mode.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              coachMode === mode.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
            }`}
          >
            <span>{mode.emoji}</span>
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-primary/30">
        <AnimatePresence initial={false}>
          {activeMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${
                  isUser 
                    ? 'bg-primary/10 border-primary/20 text-primary' 
                    : 'bg-accent/10 border-accent/20 text-accent'
                }`}>
                  {isUser ? <User size={14} /> : <Compass size={14} />}
                </div>

                {/* Bubble */}
                <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  isUser 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-bg-secondary border border-border-color text-text-primary rounded-tl-none prose dark:prose-invert max-w-none'
                }`}>
                  {/* Simplistic renderer for markdown fallback bolding */}
                  {msg.content.split('\n').map((line, lIdx) => {
                    if (line.startsWith('### ')) {
                      return <h4 key={lIdx} className="font-bold text-sm my-1.5 text-primary">{line.substring(4)}</h4>;
                    }
                    if (line.startsWith('* ') || line.startsWith('- ')) {
                      return <li key={lIdx} className="ml-3 list-disc my-0.5">{line.substring(2)}</li>;
                    }
                    if (line.startsWith('> ')) {
                      return <blockquote key={lIdx} className="border-l-2 border-primary/40 pl-2 italic my-1.5 text-text-secondary">{line.substring(2)}</blockquote>;
                    }
                    return <p key={lIdx} className="my-0.5">{line}</p>;
                  })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-accent/10 border-accent/20 text-accent">
              <Sparkles className="animate-spin text-accent" size={14} />
            </div>
            <div className="p-3 bg-bg-secondary border border-border-color rounded-2xl rounded-tl-none text-xs text-text-secondary">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Tray */}
      <form onSubmit={handleSend} className="p-3 border-t border-border-color bg-bg-secondary flex gap-2 shrink-0">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask your spiritual productivity coach..."
          disabled={loading}
          className="flex-1 bg-bg-primary border border-border-color rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !inputVal.trim()}
          className="bg-primary hover:bg-primary-hover disabled:bg-border-color text-white p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center aspect-square"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};
export default AICoachChat;
