import React, { useState } from 'react';
import { useDeenStore } from '../store/deenStore';
import { useFinanceStore } from '../store/financeStore';
import { MoonStar, Calendar, Gift, Award, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';

export const RamadanPage: React.FC = () => {
  const { t } = useTranslation();
  const { 
    ramadanFastsLogged, ramadanSuhoorChecklist, ramadanIftarChecklist, loggedSunnahFasts,
    logRamadanFast, toggleSuhoorChecklist, toggleIftarChecklist, logSunnahFast
  } = useDeenStore();
  const { expenses } = useFinanceStore();
  
  const [activeSubTab, setActiveSubTab] = useState<'ramadan' | 'hijri'>('ramadan');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const totalCharityThisMonth = expenses
    .filter(e => {
      const d = new Date(e.date);
      return e.category === 'charity' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, e) => acc + e.amount, 0);

  const handleLogFast = () => {
    if (ramadanFastsLogged >= 30) return;
    logRamadanFast();
    
    confetti({
      particleCount: 100,
      spread: 70,
      colors: ['#d97706', '#fbbf24', '#eeddcc']
    });
  };

  const handleLogSunnahFast = (monthKey: string, day: number) => {
    const key = `${monthKey}-${day}`;
    if (loggedSunnahFasts && loggedSunnahFasts[key]) return;
    
    logSunnahFast(monthKey, day);
    
    confetti({
      particleCount: 50,
      spread: 50,
      colors: ['#3b82f6', '#10b981', '#fbbf24']
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

  const hijriMonths = [
    { key: 'muharram', name: '1. Muharram', sacred: true },
    { key: 'safar', name: '2. Safar', sacred: false },
    { key: 'rabi_1', name: '3. Rabi\' al-Awwal', sacred: false },
    { key: 'rabi_2', name: '4. Rabi\' ath-Thani', sacred: false },
    { key: 'jumada_1', name: '5. Jumada al-Awwal', sacred: false },
    { key: 'jumada_2', name: '6. Jumada al-Akhirah', sacred: false },
    { key: 'rajab', name: '7. Rajab', sacred: true },
    { key: 'shaban', name: '8. Sha\'ban', sacred: false },
    { key: 'ramadan_month', name: '9. Ramadan', sacred: false },
    { key: 'shawwal', name: '10. Shawwal', sacred: false },
    { key: 'dhu_qadah', name: '11. Dhu al-Qa\'dah', sacred: true },
    { key: 'dhu_hijjah', name: '12. Dhu al-Hijjah', sacred: true }
  ];

  // Dynamic Moon Phase Calculation (Approximated synodic cycle)
  const getMoonPhaseDetails = () => {
    // Reference New Moon: Jan 6, 2000
    const refDate = new Date('2000-01-06T18:14:00Z').getTime();
    const diffMs = Date.now() - refDate;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const moonAge = diffDays % 29.530588853;

    let phaseName = 'New Moon';
    let percentage = 0;
    let svgPath = ''; // Drawing crescent paths

    if (moonAge < 1.84) {
      phaseName = 'New Moon';
      percentage = 0;
      svgPath = 'M 32 8 A 24 24 0 0 0 32 56 A 24 24 0 0 0 32 8'; // Black circle / outline
    } else if (moonAge < 5.53) {
      phaseName = 'Waxing Crescent';
      percentage = 15;
      svgPath = 'M 32 8 A 24 24 0 0 1 32 56 A 20 24 0 0 0 32 8'; // Waxing crescent shape
    } else if (moonAge < 9.22) {
      phaseName = 'First Quarter';
      percentage = 50;
      svgPath = 'M 32 8 A 24 24 0 0 1 32 56 Z'; // Half circle filled on right
    } else if (moonAge < 12.91) {
      phaseName = 'Waxing Gibbous';
      percentage = 85;
      svgPath = 'M 32 8 A 24 24 0 0 1 32 56 A 12 24 0 0 1 32 8 Z M 32 8 A 24 24 0 0 1 32 56 Z';
    } else if (moonAge < 16.61) {
      phaseName = 'Full Moon';
      percentage = 100;
      svgPath = 'M 32 8 A 24 24 0 1 1 31.9 8'; // Complete full moon circle
    } else if (moonAge < 20.3) {
      phaseName = 'Waning Gibbous';
      percentage = 85;
      svgPath = 'M 32 8 A 24 24 0 0 0 32 56 A 12 24 0 0 0 32 8 Z M 32 8 A 24 24 0 0 1 32 56 Z';
    } else if (moonAge < 23.99) {
      phaseName = 'Last Quarter';
      percentage = 50;
      svgPath = 'M 32 8 A 24 24 0 0 0 32 56 Z'; // Half circle filled on left
    } else if (moonAge < 27.68) {
      phaseName = 'Waning Crescent';
      percentage = 15;
      svgPath = 'M 32 8 A 24 24 0 0 0 32 56 A 20 24 0 0 1 32 8';
    } else {
      phaseName = 'New Moon';
      percentage = 0;
      svgPath = 'M 32 8 A 24 24 0 0 0 32 56 A 24 24 0 0 0 32 8';
    }

    return {
      name: phaseName,
      percentage: Math.round(percentage),
      age: moonAge.toFixed(1),
      svgPath
    };
  };

  const moon = getMoonPhaseDetails();

  return (
    <div className="space-y-6">
      {/* Subtab navigation */}
      <div className="flex border-b border-border-color gap-4">
        <button
          onClick={() => setActiveSubTab('ramadan')}
          className={`pb-3 text-sm font-extrabold capitalize transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'ramadan'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Ramadan spiritual dashboard
        </button>
        <button
          onClick={() => setActiveSubTab('hijri')}
          className={`pb-3 text-sm font-extrabold capitalize transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'hijri'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Calendar size={14} />
          {t('enhancements.hijri_planner')}
        </button>
      </div>

      {activeSubTab === 'ramadan' ? (
        <>
          {/* Ramadan Mode (Original View) */}
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
                  <span className="text-3xl font-black text-white font-mono">04:12:18</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#eeddcc]/60 mt-1">Time to Afur</span>
                </div>
              </div>

              <button
                onClick={handleLogFast}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl text-xs font-black transition hover:scale-105 shadow cursor-pointer"
              >
                Log Fast Completed
              </button>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="glass-card border border-border-color rounded-2xl p-5 bg-bg-secondary/40 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Suhoor Checklist</h3>
                <div className="space-y-2">
                  {suhoorItems.map((item, idx) => {
                    const isChecked = ramadanSuhoorChecklist ? ramadanSuhoorChecklist[idx] : false;
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleSuhoorChecklist(idx)}
                        className="flex items-center gap-3 w-full text-left py-1 text-xs text-text-secondary hover:text-text-primary transition cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-primary border-primary text-white' : 'border-border-color'
                        }`}>
                          {isChecked && <Check size={12} />}
                        </div>
                        <span className={isChecked ? 'line-through text-text-muted font-medium' : 'font-medium'}>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card border border-border-color rounded-2xl p-5 bg-bg-secondary/40 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Iftar Checklist</h3>
                <div className="space-y-2">
                  {iftarItems.map((item, idx) => {
                    const isChecked = ramadanIftarChecklist ? ramadanIftarChecklist[idx] : false;
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleIftarChecklist(idx)}
                        className="flex items-center gap-3 w-full text-left py-1 text-xs text-text-secondary hover:text-text-primary transition cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-primary border-primary text-white' : 'border-border-color'
                        }`}>
                          {isChecked && <Check size={12} />}
                        </div>
                        <span className={isChecked ? 'line-through text-text-muted font-medium' : 'font-medium'}>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl border border-border-color bg-bg-secondary/70 flex items-center gap-3">
              <Calendar className="text-amber-500" size={24} />
              <div>
                <span className="text-xs font-semibold text-text-muted block">Fasting Progress</span>
                <span className="text-lg font-black text-text-primary">{ramadanFastsLogged} / 30 Fasts</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border-color bg-bg-secondary/70 flex items-center gap-3">
              <Gift className="text-amber-500" size={24} />
              <div>
                <span className="text-xs font-semibold text-text-muted block">Ramadan Sadaqah Target</span>
                <span className="text-lg font-black text-text-primary">${totalCharityThisMonth.toFixed(2)} / $300</span>
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
        </>
      ) : (
        /* Hijri planner fasting calendar and moon phase visualizer */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Moon phase widget */}
          <div className="glass-card border border-amber-500/20 bg-indigo-950/20 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              {t('enhancements.moon_phase')}
            </span>

            {/* Glowing moon SVG */}
            <div className="relative w-36 h-36 flex items-center justify-center bg-black/40 rounded-full border border-white/5 shadow-inner">
              <div className="absolute w-28 h-28 rounded-full blur-xl opacity-20 bg-amber-400" />
              <svg className="w-20 h-20" viewBox="0 0 64 64">
                {/* Full Moon template (dim background) */}
                <circle cx="32" cy="32" r="24" className="fill-white/10" />
                {/* Actual Phase path */}
                <path d={moon.svgPath} className="fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              </svg>
            </div>

            <div>
              <span className="text-lg font-black text-white block capitalize">{moon.name}</span>
              <span className="text-[10px] text-[#eeddcc]/70 block mt-1">Moon Age: {moon.age} days • Illumination: {moon.percentage}%</span>
            </div>

            <p className="text-[10px] text-[#eeddcc]/50 leading-relaxed max-w-[200px]">
              The moon phase calculations determine the start of Hijri months and specify the White Days fasting schedule.
            </p>
          </div>

          {/* Hijri months calendar */}
          <div className="lg:col-span-2 glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-5">
            <div>
              <h3 className="text-base font-bold text-text-primary flex items-center gap-1.5">
                <Calendar size={18} className="text-amber-500" />
                Hijri 1447 Lunar Months Planner
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">Click on the White Days (13, 14, 15) to log a Sunnah fast and earn +20 XP</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-1">
              {hijriMonths.map((m) => (
                <div key={m.key} className="p-4 rounded-xl border border-border-color bg-bg-primary/20 flex flex-col justify-between space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-text-primary">{m.name}</span>
                    {m.sacred && (
                      <span className="text-[8px] uppercase font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        Sacred Month
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider">Ayyam al-Bidh (White Days) Fasting:</span>
                    <div className="flex gap-2">
                      {[13, 14, 15].map((day) => {
                        const isLogged = loggedSunnahFasts[`${m.key}-${day}`];
                        return (
                          <button
                            key={day}
                            onClick={() => handleLogSunnahFast(m.key, day)}
                            className={`flex-1 py-1.5 rounded-lg border text-center transition cursor-pointer ${
                              isLogged
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 font-extrabold text-[10px]'
                                : 'bg-bg-secondary border-border-color text-text-secondary hover:border-amber-500/30 text-[10px] font-bold'
                            }`}
                          >
                            {isLogged ? `Logged ✓` : `Day ${day}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RamadanPage;
