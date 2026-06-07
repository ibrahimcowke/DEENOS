import { create } from 'zustand';
import { dbService, isSupabaseConfigured } from '../services/supabase';
import { useDeenStore } from './deenStore';

export interface Habit {
  id: string;
  name: string;
  category: 'worship' | 'health' | 'learning' | 'productivity' | 'finance' | 'family' | 'custom';
  frequency: 'daily' | 'weekly';
  plantType: 'flower' | 'tree' | 'fern' | 'cactus' | 'sunflower' | 'rose';
  created_at: string;
  currentStreak: number;
  maxStreak: number;
  lastCompletedDate?: string;
}

export interface HabitLog {
  habitId: string;
  date: string;
  status: 'completed' | 'skipped' | 'missed';
}

interface HabitState {
  habits: Habit[];
  habitLogs: HabitLog[];
  
  // Actions
  syncHabitsData: () => Promise<void>;
  addHabit: (name: string, category: Habit['category'], frequency: Habit['frequency'], plantType: Habit['plantType']) => void;
  deleteHabit: (id: string) => void;
  logHabit: (habitId: string, status: HabitLog['status'], date: string) => void;
  getPlantLevel: (habit: Habit) => number; // 1 to 5
  getPlantStatus: (habit: Habit) => 'seedling' | 'sprout' | 'bud' | 'blooming' | 'wilted';
  resetHabits: () => void;
}

const getStoredHabitState = () => {
  try {
    const data = localStorage.getItem('deenos_habit_state');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return null;
};

// Start with a clean list of habits (actual data only)
const INITIAL_STATE = getStoredHabitState() || {
  habits: [],
  habitLogs: []
};

export const useHabitStore = create<HabitState>((set, get) => {
  const saveState = (newState: Partial<HabitState>) => {
    const currentState = { ...get(), ...newState };
    const { addHabit, deleteHabit, logHabit, getPlantLevel, getPlantStatus, resetHabits, syncHabitsData, ...dataToSave } = currentState;
    localStorage.setItem('deenos_habit_state', JSON.stringify(dataToSave));
  };

  return {
    ...INITIAL_STATE,

    syncHabitsData: async () => {
      const uId = useDeenStore.getState().userId;
      if (!isSupabaseConfigured || uId === 'offline-servant-user') return;

      try {
        const dbHabits = await dbService.getHabits(uId);
        
        const habitIds = dbHabits.map((h: any) => h.id);
        const dbLogs = await dbService.getHabitLogs(habitIds);

        const habitsMapped: Habit[] = dbHabits.map((h: any) => ({
          id: h.id,
          name: h.name,
          category: h.category,
          frequency: h.frequency,
          plantType: h.plant_type || 'flower',
          created_at: h.created_at,
          currentStreak: 0, // Calculated reactively or fallback
          maxStreak: 0
        }));

        const logsMapped: HabitLog[] = dbLogs.map((l: any) => ({
          habitId: l.habit_id,
          date: l.logged_date,
          status: l.status
        }));

        // Calculate streaks based on synced logs
        const finalHabits = habitsMapped.map((habit) => {
          const matchingLogs = logsMapped
            .filter((l) => l.habitId === habit.id && l.status === 'completed')
            .sort((a, b) => b.date.localeCompare(a.date)); // Latest date first
          
          let streak = 0;
          if (matchingLogs.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const latestLogDate = matchingLogs[0].date;

            if (latestLogDate === today || latestLogDate === yesterday) {
              // Streak is active! Increment backwards
              streak = 1;
              let checkDate = new Date(latestLogDate);
              for (let i = 1; i < matchingLogs.length; i++) {
                const prevExpected = new Date(checkDate.getTime() - 86400000).toISOString().split('T')[0];
                if (matchingLogs[i].date === prevExpected) {
                  streak++;
                  checkDate = new Date(prevExpected);
                } else {
                  break;
                }
              }
            }
          }

          return {
            ...habit,
            currentStreak: streak,
            maxStreak: streak,
            lastCompletedDate: matchingLogs.length > 0 ? matchingLogs[0].date : undefined
          };
        });

        const updatedState = {
          habits: finalHabits,
          habitLogs: logsMapped
        };

        set(updatedState);
        saveState(updatedState);
      } catch (e) {
        console.error('Failed syncing habits data', e);
      }
    },

    addHabit: async (name: string, category: Habit['category'], frequency: Habit['frequency'], plantType: Habit['plantType']) => {
      const uId = useDeenStore.getState().userId;
      const newHabit: Omit<Habit, 'id'> = {
        name,
        category,
        frequency,
        plantType,
        created_at: new Date().toISOString(),
        currentStreak: 0,
        maxStreak: 0
      };

      if (isSupabaseConfigured && uId !== 'offline-servant-user') {
        const response = await dbService.insertHabit(uId, {
          name,
          category,
          frequency,
          plant_type: plantType
        });
        if (response.success && response.data) {
          const finalHabit: Habit = {
            id: response.data.id,
            ...newHabit
          };
          const updated = [...get().habits, finalHabit];
          set({ habits: updated });
          saveState({ habits: updated });
        }
      } else {
        const finalHabit: Habit = {
          id: crypto.randomUUID(),
          ...newHabit
        };
        const updated = [...get().habits, finalHabit];
        set({ habits: updated });
        saveState({ habits: updated });
      }
    },

    deleteHabit: async (id: string) => {
      const updated = get().habits.filter((h: Habit) => h.id !== id);
      const updatedLogs = get().habitLogs.filter((l: HabitLog) => l.habitId !== id);
      set({ habits: updated, habitLogs: updatedLogs });
      saveState({ habits: updated, habitLogs: updatedLogs });

      // Sync with Supabase DDL
      dbService.deleteHabit(id);
    },

    logHabit: async (habitId: string, status: HabitLog['status'], date: string) => {
      const currentLogs = get().habitLogs;
      const filteredLogs = currentLogs.filter(
        (log: HabitLog) => !(log.habitId === habitId && log.date === date)
      );

      const updatedLogs = [...filteredLogs, { habitId, date, status }];
      
      const updatedHabits = get().habits.map((habit: Habit) => {
        if (habit.id === habitId) {
          let streak = habit.currentStreak;
          let max = habit.maxStreak;
          let lastCompleted = habit.lastCompletedDate;

          if (status === 'completed') {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            
            if (lastCompleted === yesterday || !lastCompleted) {
              streak += 1;
            } else if (lastCompleted === today) {
              // already done today
            } else {
              streak = 1;
            }
            lastCompleted = date;
          } else {
            streak = 0;
          }

          if (streak > max) {
            max = streak;
          }

          return {
            ...habit,
            currentStreak: streak,
            maxStreak: max,
            lastCompletedDate: lastCompleted
          };
        }
        return habit;
      });

      set({ habits: updatedHabits, habitLogs: updatedLogs });
      saveState({ habits: updatedHabits, habitLogs: updatedLogs });

      // Sync with Supabase DDL
      dbService.logHabit(habitId, status, date);
    },

    getPlantLevel: (habit: Habit) => {
      const streak = habit.currentStreak;
      if (streak === 0) return 1;
      if (streak <= 2) return 2;
      if (streak <= 5) return 3;
      if (streak <= 10) return 4;
      return 5;
    },

    getPlantStatus: (habit: Habit) => {
      const streak = habit.currentStreak;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (streak === 0 && habit.lastCompletedDate !== today && habit.lastCompletedDate !== yesterday) {
        return 'wilted';
      }
      if (streak === 0) return 'seedling';
      if (streak <= 2) return 'sprout';
      if (streak <= 5) return 'bud';
      return 'blooming';
    },

    resetHabits: () => {
      set({
        habits: [],
        habitLogs: []
      });
      localStorage.removeItem('deenos_habit_state');
    }
  };
});
