import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'xp' | 'salah' | 'quran' | 'dhikr' | 'habit' | 'goal' | 'zakat' | 'general';
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  addNotification: (title: string, body: string, type: NotificationItem['type']) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const getStoredNotifications = () => {
  try {
    const data = localStorage.getItem('deenos_notifications_state');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return null;
};

const defaultNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Welcome to DEENOS™',
    body: 'Your spiritual operating system is ready. Set your daily goals and start tracking!',
    type: 'general',
    isRead: false,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_STATE = getStoredNotifications() || {
  notifications: defaultNotifications
};

export const useNotificationStore = create<NotificationState>((set, get) => {
  const saveState = (newState: Partial<NotificationState>) => {
    const currentState = { ...get(), ...newState };
    const { addNotification, markAllAsRead, clearAll, ...dataToSave } = currentState;
    localStorage.setItem('deenos_notifications_state', JSON.stringify(dataToSave));
  };

  return {
    ...INITIAL_STATE,

    addNotification: (title: string, body: string, type: NotificationItem['type']) => {
      const newNotif: NotificationItem = {
        id: crypto.randomUUID(),
        title,
        body,
        type,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      const updated = [newNotif, ...get().notifications];
      set({ notifications: updated });
      saveState({ notifications: updated });
    },

    markAllAsRead: () => {
      const updated = get().notifications.map(n => ({ ...n, isRead: true }));
      set({ notifications: updated });
      saveState({ notifications: updated });
    },

    clearAll: () => {
      set({ notifications: [] });
      saveState({ notifications: [] });
    }
  };
});
