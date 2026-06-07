import React, { useState } from 'react';
import { useDeenStore } from '../store/deenStore';
import { MoonStar, Calendar, Gift, Award, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RamadanPage: React.FC = () => {
  const { unlockAchievement } = useDeenStore();
  const [fastsLogged, setFastsLogged] = useState(0);
  const [suhoorList, setSuhoorList] = useState([false, false, false]);
  const [iftarList, setIftarList] = useState([false, false, false]);

  const handleLogFast = () => {
    if (fastsLogged >= 30) return;
    setFastsLogged(prev => prev + 1);
    unlockAchievement('ramadan_fast');
    
    confetti({
      particleCount: 100,
      spread: 70,
      colors: ['#d97706', '#fbbf24', '#eeddcc']
    });
  };

  const suhoorItems = [
    'Eat energy-rich Suhoor meals (oats, dates, water)',
    'Pray Tahajjud / Make prolonged Du’a',
    'Stop eating exactly at Fajr (04:15 AM)'
  ];

  const iftarItems = [
    'Break fast with odd number of dates & water',
    'Recite standard Iftar supplication (Dhahaba dhama...)',
    'Pray Maghrib on time in congregation'
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-600/30 via-indigo-900/40 to-transparent border border-amber-500/30 flex justify-between items-center relative overflow-hidden">
        <div>
          <h2 className="text-2xl font-black text-amber-500 tracking-tight flex items-center gap-2">
            <MoonStar className="animate-pulse" size={24} />
            Ramadan Spiritual Mode
          </h2>
          <p className="text-xs text-[#eeddcc]/70 mt-1">Special fasting and prayer guidelines activated for the holy month of Ramadan.</p>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest block">Lunar Year</span>
          <span className="text-lg font-black text-white">Ramadan 1447 AH</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card border border-amber-500/20 bg-indigo-950/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">Iftar Countdown</span>
          
          <div className="relative w-48 h-48 flex items-center justify-center mb-4">
            <div className="absolute w-36 h-36 rounded-full blur-2xl opacity-20 bg-amber-500" />
            <div className="absolute w-36 h-36 rounded-full border border-dashed border-amber-500/20 animate-spin-slow" />
            
            <svg className="w-full h-full -rotate-90">
              <circle cx="96" cy="96" r="72" fill="none" className="stroke-amber-500/10" strokeWidth="6" />
              <circle cx="96" cy="96" r="72" fill="none" className="stroke-amber-500" strokeWidth="6" strokeDasharray="452.3" strokeDashoffset="120" strokeLinecap="round" />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">04:12:18</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#eeddcc]/60 mt-1">Time to Afur</span>
            </div>
          </div>

          <button
            onClick={handleLogFast}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl text-xs font-black transition hover:scale-105 shadow cursor-pointer"
          >
            Log Fast Completed
          </button>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="glass-card border border-border-color rounded-2xl p-5 bg-bg-secondary/40 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Suhoor Checklist</h3>
            <div className="space-y-2">
              {suhoorItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSuhoorList(suhoorList.map((val, i) => i === idx ? !val : val))}
                  className="flex items-center gap-3 w-full text-left py-1 text-xs text-text-secondary hover:text-text-primary transition cursor-pointer"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    suhoorList[idx] ? 'bg-primary border-primary text-white' : 'border-border-color'
                  }`}>
                    {suhoorList[idx] && <Check size={12} />}
                  </div>
                  <span className={suhoorList[idx] ? 'line-through text-text-muted' : ''}>{item}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card border border-border-color rounded-2xl p-5 bg-bg-secondary/40 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Iftar Checklist</h3>
            <div className="space-y-2">
              {iftarItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setIftarList(iftarList.map((val, i) => i === idx ? !val : val))}
                  className="flex items-center gap-3 w-full text-left py-1 text-xs text-text-secondary hover:text-text-primary transition cursor-pointer"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    iftarList[idx] ? 'bg-primary border-primary text-white' : 'border-border-color'
                  }`}>
                    {iftarList[idx] && <Check size={12} />}
                  </div>
                  <span className={iftarList[idx] ? 'line-through text-text-muted' : ''}>{item}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl border border-border-color bg-bg-secondary/70 flex items-center gap-3">
          <Calendar className="text-amber-500" size={24} />
          <div>
            <span className="text-xs font-semibold text-text-muted block">Fasting Progress</span>
            <span className="text-lg font-black text-text-primary">{fastsLogged} / 30 Fasts</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border-color bg-bg-secondary/70 flex items-center gap-3">
          <Gift className="text-amber-500" size={24} />
          <div>
            <span className="text-xs font-semibold text-text-muted block">Ramadan Sadaqah Target</span>
            <span className="text-lg font-black text-text-primary">$150 / $300</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border-color bg-bg-secondary/70 flex items-center gap-3">
          <Award className="text-amber-500" size={24} />
          <div>
            <span className="text-xs font-semibold text-text-muted block">Khatm Benchmark</span>
            <span className="text-lg font-black text-text-primary">1 Juz / Day</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RamadanPage;
