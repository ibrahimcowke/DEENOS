import { create } from 'zustand';
import { dbService, isSupabaseConfigured } from '../services/supabase';
import { useDeenStore } from './deenStore';
import { geminiService } from '../services/gemini';

export interface Goal {
  id: string;
  title: string;
  category: 'deen' | 'finance' | 'habits' | 'reading' | 'personal';
  roadmap: string[];
  roadmapCompleted: boolean[];
  showRoadmap: boolean;
  generatingPlan: boolean;
  deadline?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface GoalState {
  goals: Goal[];
  syncGoalsData: () => Promise<void>;
  addGoal: (title: string, category: Goal['category'], deadline?: string, priority?: Goal['priority']) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleGoalRoadmap: (id: string) => void;
  toggleGoalStep: (goalId: string, stepIdx: number) => Promise<void>;
  generateGoalRoadmap: (goalId: string, title: string, category: string) => Promise<void>;
  resetGoals: () => void;
}

const getStoredGoalsState = () => {
  try {
    const data = localStorage.getItem('deenos_goals_state');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return null;
};

const INITIAL_STATE = getStoredGoalsState() || {
  goals: []
};

export const useGoalStore = create<GoalState>((set, get) => {
  const saveState = (newState: Partial<GoalState>) => {
    const currentState = { ...get(), ...newState };
    const { addGoal, deleteGoal, toggleGoalRoadmap, toggleGoalStep, generateGoalRoadmap, resetGoals, syncGoalsData, ...dataToSave } = currentState;
    localStorage.setItem('deenos_goals_state', JSON.stringify(dataToSave));
  };

  return {
    ...INITIAL_STATE,

    syncGoalsData: async () => {
      const uId = useDeenStore.getState().userId;
      if (!isSupabaseConfigured || uId === 'offline-servant-user') return;

      try {
        const dbGoals = await dbService.getGoals(uId);

        const goalsMapped: Goal[] = dbGoals.map((g: any) => {
          const aiPlan = g.ai_plan || {};
          return {
            id: g.id,
            title: g.title,
            category: g.category as Goal['category'],
            deadline: g.target_date || undefined,
            priority: aiPlan.priority || 'medium',
            roadmap: aiPlan.roadmap || [],
            roadmapCompleted: aiPlan.roadmapCompleted || [],
            showRoadmap: !!aiPlan.showRoadmap,
            generatingPlan: false
          };
        });

        set({ goals: goalsMapped });
        saveState({ goals: goalsMapped });
      } catch (e) {
        console.error('Failed syncing goals data', e);
      }
    },

    addGoal: async (title: string, category: Goal['category'], deadline?: string, priority: Goal['priority'] = 'medium') => {
      const uId = useDeenStore.getState().userId;
      const newGoal: Omit<Goal, 'id' | 'generatingPlan'> = {
        title,
        category,
        deadline,
        priority,
        roadmap: [],
        roadmapCompleted: [],
        showRoadmap: false
      };

      if (isSupabaseConfigured && uId !== 'offline-servant-user') {
        const response = await dbService.insertGoal(uId, {
          title,
          category,
          target_date: deadline || null,
          status: 'active',
          ai_plan: {
            priority,
            roadmap: [],
            roadmapCompleted: [],
            showRoadmap: false
          }
        });
        if (response.success && response.data) {
          const finalGoal: Goal = {
            id: response.data.id,
            generatingPlan: false,
            ...newGoal
          };
          const updated = [...get().goals, finalGoal];
          set({ goals: updated });
          saveState({ goals: updated });
        }
      } else {
        const finalGoal: Goal = {
          id: crypto.randomUUID(),
          generatingPlan: false,
          ...newGoal
        };
        const updated = [...get().goals, finalGoal];
        set({ goals: updated });
        saveState({ goals: updated });
      }
    },

    deleteGoal: async (id: string) => {
      const updated = get().goals.filter((g: Goal) => g.id !== id);
      set({ goals: updated });
      saveState({ goals: updated });

      // Sync with Supabase DDL
      dbService.deleteGoal(id);
    },

    toggleGoalRoadmap: (id: string) => {
      const updated = get().goals.map((g: Goal) => {
        if (g.id === id) {
          const nextShow = !g.showRoadmap;
          // Sync update asynchronously with Supabase if online
          const uId = useDeenStore.getState().userId;
          if (isSupabaseConfigured && uId !== 'offline-servant-user') {
            dbService.updateGoal(g.id, {
              ai_plan: {
                priority: g.priority,
                roadmap: g.roadmap,
                roadmapCompleted: g.roadmapCompleted,
                showRoadmap: nextShow
              }
            });
          }
          return { ...g, showRoadmap: nextShow };
        }
        return g;
      });
      set({ goals: updated });
      saveState({ goals: updated });
    },

    toggleGoalStep: async (goalId: string, stepIdx: number) => {
      const updated = get().goals.map((g: Goal) => {
        if (g.id === goalId) {
          const nextCompleted = [...g.roadmapCompleted];
          nextCompleted[stepIdx] = !nextCompleted[stepIdx];
          
          const uId = useDeenStore.getState().userId;
          if (isSupabaseConfigured && uId !== 'offline-servant-user') {
            dbService.updateGoal(g.id, {
              ai_plan: {
                priority: g.priority,
                roadmap: g.roadmap,
                roadmapCompleted: nextCompleted,
                showRoadmap: g.showRoadmap
              }
            });
          }
          
          return { ...g, roadmapCompleted: nextCompleted };
        }
        return g;
      });
      set({ goals: updated });
      saveState({ goals: updated });
    },

    generateGoalRoadmap: async (goalId: string, title: string, category: string) => {
      // Set generatingPlan loading state
      set({
        goals: get().goals.map(g => g.id === goalId ? { ...g, generatingPlan: true, showRoadmap: true } : g)
      });

      try {
        const roadmapText = await geminiService.generateGoalRoadmap(title, category);
        
        // Parse markdown checkpoints
        const steps = roadmapText
          .split('\n')
          .filter((line: string) => line.includes('- [ ]') || line.includes('* ') || line.includes('- '))
          .map((line: string) => line.replace('- [ ]', '').replace('*', '').replace('-', '').trim())
          .filter((line: string) => line.length > 2)
          .slice(0, 5); // Take top 5 checkpoints

        const finalSteps = steps.length > 0 ? steps : ['Set daily trigger slots', 'Log progress in DeenOS', 'Keep consistency for 21 days'];
        const completedArr = new Array(finalSteps.length).fill(false);

        const updated = get().goals.map((g: Goal) => {
          if (g.id === goalId) {
            const uId = useDeenStore.getState().userId;
            if (isSupabaseConfigured && uId !== 'offline-servant-user') {
              dbService.updateGoal(g.id, {
                ai_plan: {
                  priority: g.priority,
                  roadmap: finalSteps,
                  roadmapCompleted: completedArr,
                  showRoadmap: true
                }
              });
            }
            return {
              ...g,
              roadmap: finalSteps,
              roadmapCompleted: completedArr,
              generatingPlan: false,
              showRoadmap: true
            };
          }
          return g;
        });

        set({ goals: updated });
        saveState({ goals: updated });
      } catch (e) {
        console.error(e);
        // Reset loading state on error
        set({
          goals: get().goals.map(g => g.id === goalId ? { ...g, generatingPlan: false } : g)
        });
      }
    },

    resetGoals: () => {
      set({ goals: [] });
      localStorage.removeItem('deenos_goals_state');
    }
  };
});
