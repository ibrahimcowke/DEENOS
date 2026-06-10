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
  subtitle?: string;
  type: 'prayer' | 'habit' | 'subscription' | 'journal';
  status: 'completed' | 'pending' | 'warning';
}

export const TodayTimeline: React.FC = () => {
  const { t } = useTranslation();
  const { prayerLogs } = useDeenStore();
  const { habits } = useHabitStore();
  const { subscriptions } = useFinanceStore();

  const today = new Date().toISOString().split('T')[0];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'jamaah_mosque': return "Mosque (Jama'ah)";
      case 'individual_mosque': return "Mosque (Indiv)";
      case 'completed': return 'Home (Individual)';
      case 'delayed': return 'Delayed';
      case 'missed': return 'Missed';
      case 'outside': return 'Outside';
      case 'individual_outside': return 'Outside (Indiv)';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

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
    const completed = log && (
      log.status === 'completed' || 
      log.status === 'outside' || 
      log.status === 'mosque' || 
      log.status === 'congregation' || 
      log.status === 'delayed' ||
      log.status === 'jamaah_mosque' ||
      log.status === 'individual_mosque' ||
      log.status === 'individual_outside'
    );
    
    items.push({
      id: `prayer-${p.key}`,
      time: p.order,
      displayTime: p.time,
      title: `${p.label} Prayer`,
      subtitle: log ? getStatusLabel(log.status) : 'Pending log',
      type: 'prayer',
      status: completed ? 'completed' : log?.status === 'missed' ? 'warning' : 'pending'
    });
  });

  // Add active habits
  habits.forEach((habit) => {
    const doneToday = habit.lastCompletedDate === today;
    const isMorning = habit.name.length % 2 === 0;
    
    items.push({
      id: `habit-${habit.id}`,
      time: isMorning ? '06:00' : '17:30',
      displayTime: isMorning ? '06:00 AM' : '05:30 PM',
      title: habit.name,
      subtitle: doneToday ? 'Watered & Completed ✓' : 'Needs water today 💧',
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
          title: sub.name,
          subtitle: `Renewal due today: $${sub.price}`,
          type: 'subscription',
          status: 'warning'
        });
      }
    }
  });

  // Sort chronologically
  const sortedItems = items.sort((a, b) => a.time.localeCompare(b.time));

  // Find where current time fits in sortedItems
  const curHour = new Date().getHours();
  const curMin = new Date().getMinutes();
  const curTimeString = `${curHour.toString().padStart(2, '0')}:${curMin.toString().padStart(2, '0')}`;
  
  const tempDate = new Date();
  tempDate.setHours(curHour);
  tempDate.setMinutes(curMin);
  const displayTimeString = tempDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const renderedItems: (TimelineItem | { isNowMarker: boolean; time: string; displayTime: string })[] = [];
  let nowInserted = false;

  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    if (!nowInserted && curTimeString < item.time) {
      renderedItems.push({
        isNowMarker: true,
        time: curTimeString,
        displayTime: displayTimeString
      });
      nowInserted = true;
    }
    renderedItems.push(item);
  }

  if (!nowInserted) {
    renderedItems.push({
      isNowMarker: true,
      time: curTimeString,
      displayTime: displayTimeString
    });
  }

  const getItemIcon = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="text-success fill-success/10" size={16} />;
      case 'warning':
        return <AlertCircle className="text-warning fill-warning/10" size={16} />;
      case 'pending':
      default:
        return <Circle className="text-text-muted opacity-60" size={16} />;
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

      <div className="relative pl-6 border-l-2 border-border-color space-y-5 flex-1 max-h-[450px] overflow-y-auto pr-2">
        {renderedItems.length === 1 && 'isNowMarker' in renderedItems[0] && sortedItems.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-12">Timeline is empty. Log a prayer to populate today.</p>
        ) : (
          renderedItems.map((item) => {
            if ('isNowMarker' in item) {
              return (
                <div key="now-marker" className="relative flex items-center my-4 group">
                  {/* Pulsing glow dot positioned exactly on the vertical line */}
                  <div className="absolute left-[-31px] bg-accent p-1 rounded-full border-2 border-bg-primary shadow-[0_0_10px_var(--accent)] z-10 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  
                  {/* Left current time display */}
                  <div className="text-[10px] font-black text-accent w-20 shrink-0 select-none tracking-wider uppercase animate-pulse">
                    Now ({item.displayTime})
                  </div>

                  {/* Horizontal glowing dashed divider */}
                  <div className="flex-1 border-t-2 border-dashed border-accent/40 relative flex items-center">
                    <div className="absolute right-0 h-1 w-1 rounded-full bg-accent animate-ping" />
                  </div>
                </div>
              );
            }

            return (
              <div key={item.id} className="relative flex items-start gap-4 group">
                <div className="absolute left-[-31px] top-1 bg-bg-primary p-1 rounded-full border border-border-color group-hover:border-primary transition duration-200 z-10">
                  {getItemIcon(item.status)}
                </div>

                <div className="text-xs font-semibold text-text-secondary w-20 pt-1.5 shrink-0 select-none group-hover:text-text-primary transition-colors">
                  {item.displayTime}
                </div>

                <div className="flex-1 p-3.5 rounded-xl border border-border-color/60 bg-bg-secondary/40 hover:bg-bg-secondary hover:border-primary/20 transition-all duration-200 flex items-center justify-between shadow-sm relative overflow-hidden">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-sm font-bold text-text-primary truncate">
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span className="text-[10px] text-text-muted mt-0.5 font-medium">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                  
                  <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md border shrink-0 tracking-wider ${getTypeColor(item.type)}`}>
                    {item.type}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TodayTimeline;
