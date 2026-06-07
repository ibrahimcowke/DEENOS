import React from 'react';
import { useDeenStore } from '../store/deenStore';
import type { PrayerLog } from '../store/deenStore';
import { useHabitStore } from '../store/habitStore';
import { useFinanceStore } from '../store/financeStore';
import { Clock, CheckCircle2, Circle, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TimelineItem {
  id: string;
  time: string;
  displayTime: string;
  title: string;
  type: 'prayer' | 'habit' | 'subscription' | 'journal';
  status: 'completed' | 'pending' | 'warning';
}

export const TodayTimeline: React.FC = () => {
  const { t } = useTranslation();
  const { prayerLogs } = useDeenStore();
  const { habits } = useHabitStore();
  const { subscriptions } = useFinanceStore();

  const today = new Date().toISOString().split('T')[0];

  // 1. Core Prayers Schedule
  const prayerTimes = [
    { key: 'fajr', label: t('salah.fajr') || 'Fajr', time: '04:15 AM', order: '04:15' },
    { key: 'dhuhr', label: t('salah.dhuhr') || 'Dhuhr', time: '12:45 PM', order: '12:45' },
    { key: 'asr', label: t('salah.asr') || 'Asr', time: '04:30 PM', order: '16:30' },
    { key: 'maghrib', label: t('salah.maghrib') || 'Maghrib', time: '07:10 PM', order: '19:10' },
    { key: 'isha', label: t('salah.isha') || 'Isha', time: '08:45 PM', order: '20:45' }
  ];

  const items: TimelineItem[] = [];

  // Add prayers
  prayerTimes.forEach((p) => {
    const log = prayerLogs.find((l: PrayerLog) => l.date === today && l.prayer_name === p.key);
    const completed = log && (log.status === 'completed' || log.status === 'outside' || log.status === 'mosque' || log.status === 'congregation' || log.status === 'delayed');
    
    items.push({
      id: `prayer-${p.key}`,
      time: p.order,
      displayTime: p.time,
      title: `${p.label} Prayer ${log ? `(${log.status.toUpperCase()})` : ''}`,
      type: 'prayer',
      status: completed ? 'completed' : log?.status === 'missed' ? 'warning' : 'pending'
    });
  });

  // Add active habits
  habits.forEach((habit) => {
    const doneToday = habit.lastCompletedDate === today;
    // Spread habits out at a mock morning or evening slots depending on ID length
    const isMorning = habit.name.length % 2 === 0;
    
    items.push({
      id: `habit-${habit.id}`,
      time: isMorning ? '06:00' : '17:30',
      displayTime: isMorning ? '06:00 AM' : '05:30 PM',
      title: habit.name,
      type: 'habit',
      status: doneToday ? 'completed' : 'pending'
    });
  });

  // Add active subscription reminders due today or tomorrow
  subscriptions.forEach((sub) => {
    if (sub.status === 'active') {
      const isDueSoon = sub.nextBillingDate === today;
      if (isDueSoon) {
        items.push({
          id: `sub-${sub.id}`,
          time: '09:00',
          displayTime: '09:00 AM',
          title: `Renewal: ${sub.name} ($${sub.price})`,
          type: 'subscription',
          status: 'warning'
        });
      }
    }
  });

  // Sort chronologically
  const sortedItems = items.sort((a, b) => a.time.localeCompare(b.time));

  const getItemIcon = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="text-success fill-success/10" size={16} />;
      case 'warning':
        return <AlertCircle className="text-warning fill-warning/10" size={16} />;
      case 'pending':
      default:
        return <Circle className="text-text-muted" size={16} />;
    }
  };

  const getTypeColor = (type: TimelineItem['type']) => {
    switch (type) {
      case 'prayer': return 'bg-primary/10 border-primary/20 text-primary';
      case 'habit': return 'bg-accent/10 border-accent/20 text-accent';
      case 'subscription': return 'bg-danger/10 border-danger/20 text-danger';
      case 'journal': return 'bg-info/10 border-info/20 text-info';
    }
  };

  // Get current hour for static timeline indicator alignment
  const curHour = new Date().getHours();
  const curMin = new Date().getMinutes();
  const curTimeString = `${curHour.toString().padStart(2, '0')}:${curMin.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col p-6 glass border border-border-color rounded-2xl w-full h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="text-primary" size={20} />
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Today's Timeline</h2>
        </div>
        <span className="text-[10px] text-text-muted font-bold flex items-center gap-1 uppercase">
          <RefreshCw size={10} className="animate-spin-slow" /> Live Reactive
        </span>
      </div>

      <div className="relative pl-6 border-l-2 border-border-color space-y-6 flex-1 max-h-[450px] overflow-y-auto pr-2">
        {/* Floating Now indicator based on real-time hours */}
        <div className="absolute left-[-7px] top-[180px] flex items-center gap-2 z-10 pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-accent animate-ping absolute" />
          <div className="w-3 h-3 rounded-full bg-accent border-2 border-bg-primary" />
          <span className="bg-accent text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow ml-1 uppercase tracking-widest">
            Now ({curTimeString})
          </span>
        </div>

        {sortedItems.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-12">Timeline is empty. Log a prayer to populate today.</p>
        ) : (
          sortedItems.map((item) => (
            <div key={item.id} className="relative flex items-start gap-4 group">
              <div className="absolute left-[-31px] top-1 bg-bg-primary p-1 rounded-full border border-border-color group-hover:border-primary transition">
                {getItemIcon(item.status)}
              </div>

              <div className="text-xs font-semibold text-text-secondary w-20 pt-0.5 shrink-0 select-none">
                {item.displayTime}
              </div>

              <div className="flex-1 p-3.5 rounded-xl border border-border-color/60 bg-bg-secondary/40 hover:bg-bg-secondary transition flex items-center justify-between shadow-sm">
                <span className="text-sm font-semibold text-text-primary">
                  {item.title}
                </span>
                
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getTypeColor(item.type)}`}>
                  {item.type}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default TodayTimeline;
