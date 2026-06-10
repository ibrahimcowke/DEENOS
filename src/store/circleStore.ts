import { create } from 'zustand';

export interface CircleMember {
  name: string;
  avatar: string;
  streak: number;
  deenScore: number;
  level: number;
  lastCompletedJuz?: number;
  handshakesReceived: number;
}

export interface Circle {
  id: string;
  name: string;
  code: string;
  members: CircleMember[];
  sharedKhatmProgress: number; // 0 to 100
  sharedKhatmTargetDate: string;
}

interface CircleState {
  circles: Circle[];
  createCircle: (name: string) => void;
  joinCircle: (code: string) => void;
  leaveCircle: (id: string) => void;
  sendHandshake: (circleId: string, memberName: string) => void;
  contributeToKhatm: (circleId: string, progressDelta: number) => void;
}

const defaultCircles: Circle[] = [
  {
    id: 'family-circle-1',
    name: 'Family Spiritual Circle',
    code: 'FA12-DEEN',
    sharedKhatmProgress: 45,
    sharedKhatmTargetDate: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0], // 20 days from now
    members: [
      { name: 'You', avatar: '🦁', streak: 5, deenScore: 85, level: 3, lastCompletedJuz: 30, handshakesReceived: 2 },
      { name: 'Ibrahim (Brother)', avatar: '🧠', streak: 12, deenScore: 92, level: 5, lastCompletedJuz: 28, handshakesReceived: 4 },
      { name: 'Aisha (Sister)', avatar: '🧕', streak: 8, deenScore: 78, level: 4, lastCompletedJuz: 15, handshakesReceived: 1 },
      { name: 'Fatima (Mother)', avatar: '🌸', streak: 20, deenScore: 98, level: 6, lastCompletedJuz: 1, handshakesReceived: 8 }
    ]
  },
  {
    id: 'friends-circle-1',
    name: 'University Friends',
    code: 'UNI-QURAN',
    sharedKhatmProgress: 15,
    sharedKhatmTargetDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    members: [
      { name: 'You', avatar: '🦁', streak: 5, deenScore: 85, level: 3, lastCompletedJuz: 30, handshakesReceived: 0 },
      { name: 'Ahmed', avatar: '📚', streak: 4, deenScore: 65, level: 2, lastCompletedJuz: 10, handshakesReceived: 2 },
      { name: 'Bilal', avatar: '🕌', streak: 9, deenScore: 82, level: 4, lastCompletedJuz: 12, handshakesReceived: 3 }
    ]
  }
];

const getStoredCircleState = () => {
  try {
    const data = localStorage.getItem('deenos_circle_state');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return null;
};

const INITIAL_STATE = getStoredCircleState() || {
  circles: defaultCircles
};

export const useCircleStore = create<CircleState>((set, get) => {
  const saveState = (newState: Partial<CircleState>) => {
    const currentState = { ...get(), ...newState };
    const { createCircle, joinCircle, leaveCircle, sendHandshake, contributeToKhatm, ...dataToSave } = currentState;
    localStorage.setItem('deenos_circle_state', JSON.stringify(dataToSave));
  };

  return {
    ...INITIAL_STATE,

    createCircle: (name: string) => {
      const newCircle: Circle = {
        id: crypto.randomUUID(),
        name,
        code: Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        sharedKhatmProgress: 0,
        sharedKhatmTargetDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        members: [
          { name: 'You', avatar: '🦁', streak: 1, deenScore: 85, level: 3, handshakesReceived: 0 }
        ]
      };
      const updated = [...get().circles, newCircle];
      set({ circles: updated });
      saveState({ circles: updated });
    },

    joinCircle: (code: string) => {
      const codeTrimmed = code.trim().toUpperCase();
      if (!codeTrimmed) return;

      const exists = get().circles.some(c => c.code === codeTrimmed);
      if (exists) return;

      const joinedCircle: Circle = {
        id: crypto.randomUUID(),
        name: `Joined Circle (${codeTrimmed})`,
        code: codeTrimmed,
        sharedKhatmProgress: 20,
        sharedKhatmTargetDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
        members: [
          { name: 'You', avatar: '🦁', streak: 5, deenScore: 85, level: 3, handshakesReceived: 0 },
          { name: 'Omar', avatar: '🐪', streak: 6, deenScore: 72, level: 3, handshakesReceived: 1 },
          { name: 'Zaynab', avatar: '📿', streak: 11, deenScore: 88, level: 4, handshakesReceived: 3 }
        ]
      };

      const updated = [...get().circles, joinedCircle];
      set({ circles: updated });
      saveState({ circles: updated });
    },

    leaveCircle: (id: string) => {
      const updated = get().circles.filter(c => c.id !== id);
      set({ circles: updated });
      saveState({ circles: updated });
    },

    sendHandshake: (circleId: string, memberName: string) => {
      const updated = get().circles.map(circle => {
        if (circle.id === circleId) {
          const updatedMembers = circle.members.map(member => {
            if (member.name === memberName) {
              return {
                ...member,
                handshakesReceived: member.handshakesReceived + 1
              };
            }
            return member;
          });
          return {
            ...circle,
            members: updatedMembers
          };
        }
        return circle;
      });

      set({ circles: updated });
      saveState({ circles: updated });
    },

    contributeToKhatm: (circleId: string, progressDelta: number) => {
      const updated = get().circles.map(circle => {
        if (circle.id === circleId) {
          return {
            ...circle,
            sharedKhatmProgress: Math.min(100, circle.sharedKhatmProgress + progressDelta)
          };
        }
        return circle;
      });

      set({ circles: updated });
      saveState({ circles: updated });
    }
  };
});
