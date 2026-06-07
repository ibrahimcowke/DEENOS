import React from 'react';
import { useDeenStore } from '../store/deenStore';
import type { PrayerLog } from '../store/deenStore';
import { MoonStar, BarChart3, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { useTranslation } from 'react-i18next';

export const SalahTracker: React.FC = () => {
  const { t } = useTranslation();
  const { prayerLogs, logPrayer } = useDeenStore();

  const prayers = [
    { key: 'fajr', label: t('salah.fajr'), time: '04:15 AM' },
    { key: 'dhuhr', label: t('salah.dhuhr'), time: '12:45 PM' },
    { key: 'asr', label: t('salah.asr'), time: '04:30 PM' },
    { key: 'maghrib', label: t('salah.maghrib'), time: '07:10 PM' },
    { key: 'isha', label: t('salah.isha'), time: '08:45 PM' }
  ];

  const today = new Date().toISOString().split('T')[0];

  const getPrayerStatus = (prayerKey: string) => {
    const log = prayerLogs.find((l: PrayerLog) => l.date === today && l.prayer_name === prayerKey);
    return log ? log.status : null;
  };

  const handleLog = (prayerKey: string, status: PrayerLog['status']) => {
    logPrayer(prayerKey, status, today);
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
    { name: 'Delayed', value: 3 },
    { name: 'Missed', value: 2 }
  ];

  const getStatusStyle = (status: string | null, btnStatus: PrayerLog['status']) => {
    const isActive = status === btnStatus;
    if (!isActive) return 'bg-bg-tertiary border-border-color text-text-secondary hover:bg-bg-primary hover:border-text-muted';
    
    switch (btnStatus) {
      case 'mosque':
        return 'bg-emerald-600 text-white border-emerald-700 shadow';
      case 'congregation':
        return 'bg-teal-600 text-white border-teal-700 shadow';
      case 'completed':
        return 'bg-primary text-white border-primary-hover shadow';
      case 'delayed':
        return 'bg-amber-500 text-white border-amber-600 shadow';
      case 'missed':
        return 'bg-red-500 text-white border-red-600 shadow';
    }
  };

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
            const activeStatus = getPrayerStatus(p.key);
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

                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleLog(p.key, 'mosque')}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition duration-200 cursor-pointer ${getStatusStyle(activeStatus, 'mosque')}`}
                  >
                    Mosque (25XP)
                  </button>
                  <button 
                    onClick={() => handleLog(p.key, 'congregation')}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition duration-200 cursor-pointer ${getStatusStyle(activeStatus, 'congregation')}`}
                  >
                    Jama'ah (15XP)
                  </button>
                  <button 
                    onClick={() => handleLog(p.key, 'completed')}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition duration-200 cursor-pointer ${getStatusStyle(activeStatus, 'completed')}`}
                  >
                    Home (10XP)
                  </button>
                  <button 
                    onClick={() => handleLog(p.key, 'delayed')}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition duration-200 cursor-pointer ${getStatusStyle(activeStatus, 'delayed')}`}
                  >
                    Delayed (5XP)
                  </button>
                  <button 
                    onClick={() => handleLog(p.key, 'missed')}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition duration-200 cursor-pointer ${getStatusStyle(activeStatus, 'missed')}`}
                  >
                    Missed
                  </button>
                </div>
              </div>
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
            <ResponsiveContainer width="100%" height="100%">
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
            <ResponsiveContainer width="100%" height="100%">
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
