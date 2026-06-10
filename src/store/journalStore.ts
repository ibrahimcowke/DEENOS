import { create } from 'zustand';
import { dbService, isSupabaseConfigured } from '../services/supabase';
import { useDeenStore } from './deenStore';

export interface JournalLog {
  id: string;
  date: string;
  mood: string;
  prompt: string;
  text: string;
  aiSummary: string;
}

interface JournalState {
  logs: JournalLog[];
  syncJournalData: () => Promise<void>;
  addJournalEntry: (mood: string, prompt: string, text: string, aiSummary: string) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
  resetJournal: () => void;
}

const getStoredJournalState = () => {
  try {
    const data = localStorage.getItem('deenos_journal_state');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return null;
};

const INITIAL_STATE = getStoredJournalState() || {
  logs: []
};

export const useJournalStore = create<JournalState>((set, get) => {
  const saveState = (newState: Partial<JournalState>) => {
    const currentState = { ...get(), ...newState };
    const { addJournalEntry, deleteJournalEntry, resetJournal, syncJournalData, ...dataToSave } = currentState;
    localStorage.setItem('deenos_journal_state', JSON.stringify(dataToSave));
  };

  return {
    ...INITIAL_STATE,

    syncJournalData: async () => {
      const uId = useDeenStore.getState().userId;
      if (!isSupabaseConfigured || uId === 'offline-servant-user') return;

      try {
        const dbEntries = await dbService.getJournalEntries(uId);

        const logsMapped: JournalLog[] = dbEntries.map((e: any) => ({
          id: e.id,
          date: e.entry_date,
          mood: e.mood,
          prompt: e.prompt,
          text: e.response,
          aiSummary: e.ai_summary || ''
        }));

        set({ logs: logsMapped });
        saveState({ logs: logsMapped });
      } catch (e) {
        console.error('Failed syncing journal data', e);
      }
    },

    addJournalEntry: async (mood: string, prompt: string, text: string, aiSummary: string) => {
      const uId = useDeenStore.getState().userId;
      const today = new Date().toISOString().split('T')[0];
      const newEntry: Omit<JournalLog, 'id'> = {
        date: today,
        mood,
        prompt,
        text,
        aiSummary
      };

      if (isSupabaseConfigured && uId !== 'offline-servant-user') {
        const response = await dbService.insertJournalEntry(uId, {
          entry_date: today,
          prompt,
          response: text,
          mood,
          ai_summary: aiSummary
        });
        if (response.success && response.data) {
          const finalEntry: JournalLog = {
            id: response.data.id,
            ...newEntry
          };
          const updated = [finalEntry, ...get().logs];
          set({ logs: updated });
          saveState({ logs: updated });
        }
      } else {
        const finalEntry: JournalLog = {
          id: crypto.randomUUID(),
          ...newEntry
        };
        const updated = [finalEntry, ...get().logs];
        set({ logs: updated });
        saveState({ logs: updated });
      }
    },

    deleteJournalEntry: async (id: string) => {
      const updated = get().logs.filter((log: JournalLog) => log.id !== id);
      set({ logs: updated });
      saveState({ logs: updated });

      // Sync with Supabase DDL
      dbService.deleteJournalEntry(id);
    },

    resetJournal: () => {
      set({ logs: [] });
      localStorage.removeItem('deenos_journal_state');
    }
  };
});
