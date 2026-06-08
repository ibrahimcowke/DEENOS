import React from 'react';
import { useDeenStore } from '../store/deenStore';
import { MoonStar, BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { useTranslation } from 'react-i18next';

export const SalahTracker: React.FC = () => {
  const { t } = useTranslation();
  const { prayerLogs, logPrayer, nawafilLogs, logNawafil } = useDeenStore();

  const nawafils = [
    { key: 'tahajjud', label: 'Tahajjud (Night Prayer)', time: 'Last 1/3 of Night' },
    { key: 'ishraq', label: 'Ishraq (Post-Sunrise)', time: '15 mins after Sunrise' },
    { key: 'duha', label: 'Duha (Forenoon Prayer)', time: 'Mid-morning' },
    { key: 'witr', label: 'Witr (Odd Prayer)', time: 'Post-Isha / Night' },
    { key: 'sunnah_rawatib', label: 'Sunnah Rawatib', time: "12 daily optional raka'ah" }
  ];

  const prayers = [
    { key: 'fajr', label: t('salah.fajr'), time: '04:15 AM' },
    { key: 'dhuhr', label: t('salah.dhuhr'), time: '12:45 PM' },
    { key: 'asr', label: t('salah.asr'), time: '04:30 PM' },
    { key: 'maghrib', label: t('salah.maghrib'), time: '07:10 PM' },
    { key: 'isha', label: t('salah.isha'), time: '08:45 PM' }
  ];

  const today = new Date().toISOString().split('T')[0];

  const getPrayerStatus = (prayerKey: string) => {
    const log = prayerLogs.find((l) => l.date === today && l.prayer_name === prayerKey);
    return log ? log.status : null;
  };

  const handleToggle = (prayerKey: string, option: string) => {
    const currentStatus = getPrayerStatus(prayerKey);
    let newStatus = '';

    if (option === 'missed') {
      newStatus = currentStatus === 'missed' ? '' : 'missed';
    } else if (option === 'completed') {
      const hasPrayed = currentStatus && currentStatus !== 'missed' && currentStatus.includes('completed');
      newStatus = hasPrayed ? '' : 'completed';
    } else {
      // Modifiers
      let options = currentStatus && currentStatus !== 'missed' ? currentStatus.split(',').filter(Boolean) : [];
      
      if (options.includes(option)) {
        options = options.filter(o => o !== option);
      } else {
        options.push(option);
      }
      
      // Ensure 'completed' tag is present if we have modifiers
      if (options.length > 0 && !options.includes('completed')) {
        options.push('completed');
      }

      // Mutual exclusivity for mosque vs outside
      if (option === 'mosque' && options.includes('outside')) {
        options = options.filter(o => o !== 'outside');
      }
      if (option === 'outside' && options.includes('mosque')) {
        options = options.filter(o => o !== 'mosque');
      }
      
      newStatus = options.join(',');
    }

    logPrayer(prayerKey, newStatus, today);
  };

  const isNawafilLogged = (key: string) => {
    const logs = nawafilLogs || [];
    return logs.some((l) => l.prayer_name === key && l.date === today);
  };

  const handleNawafilLog = (key: string) => {
    logNawafil(key, today);
  };

  const weeklyAnalyticsData = [
    { day: 'Mon', rate: 80 },
    { day: 'Tue', rate: 100 },
    { day: 'Wed', rate: 60 },
    { day: 'Thu', rate: 80 },
    { day: 'Fri', rate: 100 },
    { day: 'Sat', rate: 100 },
    { day: 'Sun', rate: 85 }
  ];

  const prayerDistributionData = [
    { name: 'Mosque', value: 12 },
    { name: 'Congregation', value: 8 },
    { name: 'Home', value: 15 },
    { name: 'Outside', value: 6 },
    { name: 'Delayed', value: 3 },
    { name: 'Missed', value: 2 }
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
        <div className="flex items-center gap-2 mb-6">
          <MoonStar className="text-primary" size={24} />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">{t('salah.tracker_title')}</h2>
            <p className="text-xs text-text-secondary mt-0.5">{t('salah.tracker_subtitle')}</p>
          </div>
        </div>

        <div className="space-y-4">
          {prayers.map((p) => {
            const status = getPrayerStatus(p.key) || '';
            const hasPrayed = status !== 'missed' && status.includes('completed');
            const isMissed = status === 'missed';

            return (
              <div 
                key={p.key} 
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border-color bg-bg-secondary/80 gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
                    {p.label.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-text-primary block">{p.label}</span>
                    <span className="text-[10px] text-text-muted mt-0.5 block">{p.time}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Primary Status Controls */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggle(p.key, 'completed')}
                      className={`px-4 py-2 rounded-xl border text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        hasPrayed 
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-sm font-black'
                          : 'bg-bg-tertiary border-border-color text-text-secondary hover:border-text-muted'
                      }`}
                    >
                      <span>Prayed</span>
                    </button>
                    
                    <button 
                      onClick={() => handleToggle(p.key, 'missed')}
                      className={`px-4 py-2 rounded-xl border text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        isMissed 
                          ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-sm font-black'
                          : 'bg-bg-tertiary border-border-color text-text-secondary hover:border-text-muted'
                      }`}
                    >
                      <span>Missed</span>
                    </button>
                  </div>

                  {/* Multi-Selection Sub-options (Only shown if prayed) */}
                  {hasPrayed && (
                    <div className="flex flex-wrap gap-2 border-t sm:border-t-0 sm:border-l border-border-color/60 pt-3 sm:pt-0 sm:pl-3 w-full sm:w-auto">
                      <button 
                        onClick={() => handleToggle(p.key, 'mosque')}
                        className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition duration-150 cursor-pointer flex items-center gap-1 ${
                          status.includes('mosque')
                            ? 'bg-emerald-600 border-emerald-700 text-white shadow font-black'
                            : 'bg-bg-tertiary border-border-color text-text-muted hover:border-text-secondary'
                        }`}
                      >
                        <span>Mosque (+15 XP)</span>
                      </button>
                      
                      <button 
                        onClick={() => handleToggle(p.key, 'congregation')}
                        className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition duration-150 cursor-pointer flex items-center gap-1 ${
                          status.includes('congregation')
                            ? 'bg-teal-600 border-teal-700 text-white shadow font-black'
                            : 'bg-bg-tertiary border-border-color text-text-muted hover:border-text-secondary'
                        }`}
                      >
                        <span>Jama'ah (+5 XP)</span>
                      </button>
                      
                      <button 
                        onClick={() => handleToggle(p.key, 'outside')}
                        className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition duration-150 cursor-pointer flex items-center gap-1 ${
                          status.includes('outside')
                            ? 'bg-blue-600 border-blue-700 text-white shadow font-black'
                            : 'bg-bg-tertiary border-border-color text-text-muted hover:border-text-secondary'
                        }`}
                      >
                        <span>Outside</span>
                      </button>
                      
                      <button 
                        onClick={() => handleToggle(p.key, 'delayed')}
                        className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition duration-150 cursor-pointer flex items-center gap-1 ${
                          status.includes('delayed')
                            ? 'bg-amber-500 border-amber-600 text-white shadow font-black'
                            : 'bg-bg-tertiary border-border-color text-text-muted hover:border-text-secondary'
                        }`}
                      >
                        <span>Delayed</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nawafil & Sunnah Section */}
      <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-500" size={24} />
            <div>
              <h2 className="text-xl font-bold tracking-tight text-text-primary">Nawafil & Sunnah Prayers</h2>
              <p className="text-xs text-text-secondary mt-0.5">Earn +5 XP for each optional sunnah or night prayer logged</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nawafils.map((n) => {
            const isLogged = isNawafilLogged(n.key);
            return (
              <button
                key={n.key}
                onClick={() => handleNawafilLog(n.key)}
                className={`flex items-center justify-between p-4 rounded-xl border transition duration-200 cursor-pointer text-left w-full ${
                  isLogged
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-sm shadow-amber-500/5'
                    : 'bg-bg-secondary/80 border-border-color text-text-secondary hover:border-text-muted hover:bg-bg-secondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isLogged ? 'bg-amber-500/20 text-amber-500' : 'bg-bg-tertiary border border-border-color text-text-muted'
                  }`}>
                    {n.label.charAt(0)}
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${isLogged ? 'text-amber-500' : 'text-text-primary'}`}>
                      {n.label}
                    </span>
                    <span className="text-[9px] text-text-muted mt-0.5 block">{n.time}</span>
                  </div>
                </div>
                <div className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  isLogged ? 'bg-amber-500 text-white' : 'bg-bg-tertiary text-text-muted border border-border-color'
                }`}>
                  {isLogged ? 'Logged' : '+5 XP'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            {t('salah.weekly_trends')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={weeklyAnalyticsData}>
                <defs>
                  <linearGradient id="salahGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: 11 }}
                />
                <Area type="monotone" dataKey="rate" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#salahGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            Prayer Location Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={prayerDistributionData}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: 11 }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalahTracker;
