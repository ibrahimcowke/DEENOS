import { create } from 'zustand';
import confetti from 'canvas-confetti';
import { dbService, isSupabaseConfigured } from '../services/supabase';

export interface PrayerLog {
  prayer_name: string;
  status: string;
  date: string;
}

export interface QuranLog {
  id: string;
  date: string;
  amount: number;
  surah: number;
  ayah: number;
  mode: 'pages' | 'ayahs';
}

export interface QuranProgress {
  pagesRead: number;
  lastSurah: number;
  lastAyah: number;
  targetPages: number;
  completedJuz: number[];
}

export interface DhikrLog {
  name: string;
  count: number;
  date: string;
}

export interface NawafilLog {
  prayer_name: string;
  date: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  badge: string;
  unlocked: boolean;
}

interface DeenState {
  prayerLogs: PrayerLog[];
  quranProgress: QuranProgress;
  quranLogs: QuranLog[];
  dhikrLogs: DhikrLog[];
  nawafilLogs: NawafilLog[];
  xp: number;
  level: number;
  dailyStreak: number;
  achievements: Achievement[];
  userId: string;
  
  // Actions
  setUserId: (id: string) => void;
  syncSpiritualData: () => Promise<void>;
  syncOfflineData: () => Promise<void>;
  logPrayer: (prayerName: string, status: string, date: string) => void;
  logNawafil: (prayerName: string, date: string) => void;
  updateQuranProgress: (amount: number, surah: number, ayah: number, mode: 'pages' | 'ayahs') => void;
  editQuranLog: (id: string, amount: number, surah: number, ayah: number, mode: 'pages' | 'ayahs', date: string) => void;
  deleteQuranLog: (id: string) => void;
  logDhikr: (name: string, count: number, date: string) => void;
  addXp: (amount: number) => void;
  getDeenScore: () => number;
  unlockAchievement: (id: string) => void;
  resetAll: () => void;
}

const defaultAchievements: Achievement[] = [
  { id: 'first_prayer', name: 'First Bow', description: 'Log your first prayer', xpReward: 50, badge: '🕌', unlocked: false },
  { id: 'five_prayers_day', name: 'Day of Light', description: 'Log all 5 prayers in one day', xpReward: 150, badge: '✨', unlocked: false },
  { id: 'congregation_salah', name: 'Stronger Together', description: 'Pray in the mosque or congregation', xpReward: 100, badge: '👥', unlocked: false },
  { id: 'quran_start', name: 'Divine Guidance', description: 'Log your first pages of Quran reading', xpReward: 50, badge: '📖', unlocked: false },
  { id: 'tasbih_master', name: 'Dhikr Master', description: 'Log 100 dhikr counts in a single tasbih session', xpReward: 75, badge: '📿', unlocked: false },
  { id: 'streak_3d', name: 'Consistent Soul', description: 'Maintain a 3-day spiritual logging streak', xpReward: 100, badge: '🔥', unlocked: false },
  { id: 'zakat_paid', name: 'Pure Heart', description: 'Calculate and log a Zakat payment', xpReward: 200, badge: '💝', unlocked: false },
  { id: 'ramadan_fast', name: 'Fasting Champ', description: 'Log a Ramadan fast completed', xpReward: 120, badge: '🌙', unlocked: false }
];

const getStoredDeenState = () => {
  try {
    const data = localStorage.getItem('deenos_spiritual_state');
    if (data) {
      const parsed = JSON.parse(data);
      if (!parsed.achievements || parsed.achievements.length === 0) {
        parsed.achievements = defaultAchievements;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed parsing state', e);
  }
  return null;
};

// Start with a 100% clean starting slate
const INITIAL_STATE = getStoredDeenState() || {
  prayerLogs: [],
  quranProgress: {
    pagesRead: 0,
    lastSurah: 1,
    lastAyah: 1,
    targetPages: 604,
    completedJuz: []
  },
  quranLogs: [],
  dhikrLogs: [],
  nawafilLogs: [],
  xp: 0,
  level: 1,
  dailyStreak: 1,
  achievements: defaultAchievements,
  userId: 'offline-servant-user'
};

export const useDeenStore = create<DeenState>((set, get) => {
  const saveState = (newState: Partial<DeenState>) => {
    const currentState = { ...get(), ...newState };
    const { logPrayer, logNawafil, updateQuranProgress, editQuranLog, deleteQuranLog, logDhikr, addXp, getDeenScore, unlockAchievement, resetAll, setUserId, syncSpiritualData, syncOfflineData, ...dataToSave } = currentState;
    localStorage.setItem('deenos_spiritual_state', JSON.stringify(dataToSave));
  };

  return {
    ...INITIAL_STATE,
    nawafilLogs: INITIAL_STATE.nawafilLogs || [],
    quranLogs: INITIAL_STATE.quranLogs || [],

    setUserId: (id: string) => {
      set({ userId: id });
    },

    syncSpiritualData: async () => {
      const uId = get().userId;
      if (!isSupabaseConfigured || uId === 'offline-servant-user') return;
      
      try {
        const prayers = await dbService.getPrayerLogs(uId);
        const quran = await dbService.getQuranProgress(uId);
        const dhikr = await dbService.getDhikrLogs(uId);
        const profile = await dbService.getProfile(uId);

        // Map database records back to Zustand store format
        const prayerLogsMapped: PrayerLog[] = prayers.map((p: any) => ({
          prayer_name: p.prayer_name,
          status: p.status,
          date: p.prayer_date
        }));

        const dhikrLogsMapped: DhikrLog[] = dhikr.map((d: any) => ({
          name: d.dhikr_name,
          count: d.count,
          date: d.logged_at.split('T')[0]
        }));

        let quranProgMapped = get().quranProgress;
        if (quran && quran.length > 0) {
          const latestRead = quran[0];
          quranProgMapped = {
            pagesRead: latestRead.total_pages_read,
            lastSurah: latestRead.surah_number,
            lastAyah: latestRead.ayah_number,
            targetPages: 604,
            completedJuz: []
          };
        }

        const updatedState = {
          prayerLogs: prayerLogsMapped,
          dhikrLogs: dhikrLogsMapped,
          quranProgress: quranProgMapped,
          level: profile.current_level || get().level,
          xp: profile.current_xp || get().xp
        };

        set(updatedState);
        saveState(updatedState);
      } catch (e) {
        console.error('Failed syncing spiritual data', e);
      }
    },

    syncOfflineData: async () => {
      const uId = get().userId;
      if (!isSupabaseConfigured || uId === 'offline-servant-user' || !navigator.onLine) return;

      try {
        // 1. Push prayers
        const prayers = get().prayerLogs;
        for (const p of prayers) {
          await dbService.logPrayer(uId, p.prayer_name, p.status, p.date);
        }

        // 2. Push dhikrs
        const dhikrs = get().dhikrLogs;
        for (const d of dhikrs) {
          await dbService.insertDhikrLog(uId, {
            dhikr_name: d.name,
            count: d.count,
            logged_at: new Date(d.date).toISOString()
          });
        }

        // 3. Push Quran progress
        const quran = get().quranProgress;
        await dbService.syncQuranProgress(uId, {
          surah_number: quran.lastSurah,
          ayah_number: quran.lastAyah,
          page_number: Math.min(604, Math.floor(quran.pagesRead / 20) + 1),
          juz_number: Math.min(30, Math.floor(quran.pagesRead / 20) + 1),
          total_pages_read: quran.pagesRead
        });

        console.log('DEENOS™: Offline local changes synced to Supabase successfully.');
      } catch (e) {
        console.error('DEENOS™: Failed pushing offline data', e);
      }
    },

    logPrayer: (prayerName: string, status: string, date: string) => {
      const currentLogs = get().prayerLogs;
      const filtered = currentLogs.filter(
        (log: PrayerLog) => !(log.prayer_name === prayerName && log.date === date)
      );
      
      const existingLog = currentLogs.find(
        (log: PrayerLog) => log.prayer_name === prayerName && log.date === date
      );

      const updatedLogs = status 
        ? [...filtered, { prayer_name: prayerName, status, date }]
        : filtered;

      set({ prayerLogs: updatedLogs });
      saveState({ prayerLogs: updatedLogs });

      // Sync with Supabase DDL
      if (status) {
        dbService.logPrayer(get().userId, prayerName, status, date);
      }

      // Calculate XP diff
      const getStatusXp = (stat: string | null) => {
        if (!stat || stat === 'missed') return 0;
        const opts = stat.split(',');
        if (opts.includes('delayed')) return 5;
        if (opts.includes('mosque')) return 25;
        if (opts.includes('congregation')) return 15;
        return 10; // completed or outside
      };

      const prevXp = existingLog ? getStatusXp(existingLog.status) : 0;
      const newXp = getStatusXp(status);
      const xpDiff = newXp - prevXp;

      if (xpDiff !== 0) {
        get().addXp(xpDiff);
      }

      if (status && !status.includes('missed')) {
        get().unlockAchievement('first_prayer');
      }
      
      if (status && (status.includes('mosque') || status.includes('congregation'))) {
        get().unlockAchievement('congregation_salah');
      }

      const prayersToday = updatedLogs.filter(
        (log: PrayerLog) => log.date === date && (log.status.includes('completed') || log.status.includes('outside') || log.status.includes('mosque') || log.status.includes('congregation'))
      );
      if (prayersToday.length === 5) {
        get().unlockAchievement('five_prayers_day');
      }
    },

    logNawafil: (prayerName: string, date: string) => {
      const currentLogs = get().nawafilLogs || [];
      const exists = currentLogs.some(
        (log: NawafilLog) => log.prayer_name === prayerName && log.date === date
      );

      let updatedLogs;
      if (exists) {
        updatedLogs = currentLogs.filter(
          (log: NawafilLog) => !(log.prayer_name === prayerName && log.date === date)
        );
        set({ nawafilLogs: updatedLogs });
        saveState({ nawafilLogs: updatedLogs });
        get().addXp(-5);
      } else {
        updatedLogs = [...currentLogs, { prayer_name: prayerName, date }];
        set({ nawafilLogs: updatedLogs });
        saveState({ nawafilLogs: updatedLogs });
        get().addXp(5);
      }
    },

    updateQuranProgress: (amount: number, surah: number, ayah: number, mode: 'pages' | 'ayahs') => {
      const current = get().quranProgress;
      let pagesAdded = 0;
      let xpEarned = 0;

      if (mode === 'pages') {
        pagesAdded = amount;
        xpEarned = amount * 15;
      } else {
        pagesAdded = Math.max(1, Math.round(amount / 15));
        xpEarned = amount * 1; // 1 XP per Ayah
      }

      const updated = {
        ...current,
        pagesRead: current.pagesRead + pagesAdded,
        lastSurah: surah,
        lastAyah: ayah
      };

      const newLog: QuranLog = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        amount,
        surah,
        ayah,
        mode
      };
      const updatedLogs = [...(get().quranLogs || []), newLog];
      
      set({ quranProgress: updated, quranLogs: updatedLogs });
      saveState({ quranProgress: updated, quranLogs: updatedLogs });
      
      // Sync with Supabase DDL
      dbService.syncQuranProgress(get().userId, {
        surah_number: surah,
        ayah_number: ayah,
        page_number: Math.min(604, Math.floor(updated.pagesRead / 20) + 1),
        juz_number: Math.min(30, Math.floor(updated.pagesRead / 20) + 1),
        total_pages_read: updated.pagesRead
      });

      get().addXp(xpEarned);
      get().unlockAchievement('quran_start');
    },

    editQuranLog: (id: string, amount: number, surah: number, ayah: number, mode: 'pages' | 'ayahs', date: string) => {
      const logs = get().quranLogs || [];
      const updatedLogs = logs.map(log => log.id === id ? { ...log, amount, surah, ayah, mode, date } : log);
      
      let totalPagesRead = 0;
      let lastSurah = 1;
      let lastAyah = 1;
      
      const sortedLogs = [...updatedLogs].sort((a, b) => a.date.localeCompare(b.date));
      if (sortedLogs.length > 0) {
        const latest = sortedLogs[sortedLogs.length - 1];
        lastSurah = latest.surah;
        lastAyah = latest.ayah;
      }
      
      updatedLogs.forEach(log => {
        const pages = log.mode === 'pages' ? log.amount : Math.max(1, Math.round(log.amount / 15));
        totalPagesRead += pages;
      });
      
      const quranProgress = {
        ...get().quranProgress,
        pagesRead: totalPagesRead,
        lastSurah,
        lastAyah
      };
      
      set({ quranLogs: updatedLogs, quranProgress });
      saveState({ quranLogs: updatedLogs, quranProgress });
      
      dbService.syncQuranProgress(get().userId, {
        surah_number: lastSurah,
        ayah_number: lastAyah,
        page_number: Math.min(604, Math.floor(totalPagesRead / 20) + 1),
        juz_number: Math.min(30, Math.floor(totalPagesRead / 20) + 1),
        total_pages_read: totalPagesRead
      });
    },

    deleteQuranLog: (id: string) => {
      const logs = get().quranLogs || [];
      const targetLog = logs.find(l => l.id === id);
      if (!targetLog) return;
      
      const updatedLogs = logs.filter(log => log.id !== id);
      
      let totalPagesRead = 0;
      let lastSurah = 1;
      let lastAyah = 1;
      
      const sortedLogs = [...updatedLogs].sort((a, b) => a.date.localeCompare(b.date));
      if (sortedLogs.length > 0) {
        const latest = sortedLogs[sortedLogs.length - 1];
        lastSurah = latest.surah;
        lastAyah = latest.ayah;
      }
      
      updatedLogs.forEach(log => {
        const pages = log.mode === 'pages' ? log.amount : Math.max(1, Math.round(log.amount / 15));
        totalPagesRead += pages;
      });
      
      const quranProgress = {
        ...get().quranProgress,
        pagesRead: totalPagesRead,
        lastSurah,
        lastAyah
      };
      
      let xpDeducted = 0;
      if (targetLog.mode === 'pages') {
        xpDeducted = targetLog.amount * 15;
      } else {
        xpDeducted = targetLog.amount * 1;
      }
      const newXp = Math.max(0, get().xp - xpDeducted);
      
      set({ quranLogs: updatedLogs, quranProgress, xp: newXp });
      saveState({ quranLogs: updatedLogs, quranProgress, xp: newXp });
      
      dbService.syncQuranProgress(get().userId, {
        surah_number: lastSurah,
        ayah_number: lastAyah,
        page_number: Math.min(604, Math.floor(totalPagesRead / 20) + 1),
        juz_number: Math.min(30, Math.floor(totalPagesRead / 20) + 1),
        total_pages_read: totalPagesRead
      });
    },

    logDhikr: (name: string, count: number, date: string) => {
      const currentLogs = get().dhikrLogs;
      const updatedLogs = [...currentLogs, { name, count, date }];
      
      set({ dhikrLogs: updatedLogs });
      saveState({ dhikrLogs: updatedLogs });

      // Sync with Supabase DDL
      dbService.insertDhikrLog(get().userId, {
        dhikr_name: name,
        count,
        logged_at: new Date(date).toISOString()
      });

      get().addXp(Math.floor(count / 10));
      if (count >= 100) {
        get().unlockAchievement('tasbih_master');
      }
    },

    addXp: (amount: number) => {
      const currentXp = get().xp;
      const currentLevel = get().level;
      const xpNeeded = currentLevel * 1000;
      
      let nextXp = currentXp + amount;
      let nextLevel = currentLevel;

      if (nextXp >= xpNeeded) {
        nextXp -= xpNeeded;
        nextLevel += 1;
        
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
        }, 100);
      }

      set({ xp: nextXp, level: nextLevel });
      saveState({ xp: nextXp, level: nextLevel });

      // Sync with Supabase DDL profile
      dbService.syncProfile(get().userId, {
        current_level: nextLevel,
        current_xp: nextXp
      });
    },

    unlockAchievement: (id: string) => {
      const achievements = get().achievements.map((ach: Achievement) => {
        if (ach.id === id && !ach.unlocked) {
          setTimeout(() => {
            confetti({
              particleCount: 80,
              spread: 60,
              colors: ['#fbbf24', '#f59e0b', '#10b981']
            });
          }, 50);
          
          get().addXp(ach.xpReward);
          return { ...ach, unlocked: true };
        }
        return ach;
      });

      set({ achievements });
      saveState({ achievements });
    },

    getDeenScore: () => {
      const today = new Date().toISOString().split('T')[0];
      const todayLogs = get().prayerLogs.filter((log: PrayerLog) => log.date === today);
      const todayDhikr = get().dhikrLogs.filter((log: DhikrLog) => log.date === today);
      
      const positiveSalahCount = todayLogs.filter(
        (log: PrayerLog) => log.status.includes('completed') || log.status.includes('outside') || log.status.includes('mosque') || log.status.includes('congregation') || log.status.includes('delayed')
      ).length;
      const salahScore = Math.min(50, positiveSalahCount * 10);

      const dhikrCount = todayDhikr.reduce((acc: number, log: DhikrLog) => acc + log.count, 0);
      const dhikrScore = Math.min(20, Math.floor(dhikrCount / 5));

      const hasReadQuranToday = get().quranProgress.pagesRead > 0 ? 30 : 0;

      return Math.min(100, salahScore + dhikrScore + hasReadQuranToday);
    },

    resetAll: () => {
      set({
        prayerLogs: [],
        quranProgress: {
          pagesRead: 0,
          lastSurah: 1,
          lastAyah: 1,
          targetPages: 604,
          completedJuz: []
        },
        quranLogs: [],
        dhikrLogs: [],
        nawafilLogs: [],
        xp: 0,
        level: 1,
        dailyStreak: 1,
        achievements: defaultAchievements
      });
      localStorage.removeItem('deenos_spiritual_state');
    }
  };
});
