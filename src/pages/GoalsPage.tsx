import React, { useState } from 'react';
import { geminiService } from '../services/gemini';
import { Target, PlusCircle, Sparkles, CheckSquare, Square, Trash2 } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  category: 'deen' | 'finance' | 'habits' | 'reading' | 'personal';
  roadmap: string[];
  roadmapCompleted: boolean[];
  showRoadmap: boolean;
  generatingPlan: boolean;
}

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Goal['category']>('deen');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title,
      category,
      roadmap: [],
      roadmapCompleted: [],
      showRoadmap: false,
      generatingPlan: false
    };

    setGoals([...goals, newGoal]);
    setTitle('');
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleToggleRoadmap = (goalId: string) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, showRoadmap: !g.showRoadmap } : g));
  };

  const handleToggleStep = (goalId: string, stepIdx: number) => {
    setGoals(goals.map(g => {
      if (g.id === goalId) {
        const nextCompleted = [...g.roadmapCompleted];
        nextCompleted[stepIdx] = !nextCompleted[stepIdx];
        return { ...g, roadmapCompleted: nextCompleted };
      }
      return g;
    }));
  };

  const handleGenerateRoadmap = async (goalId: string, goalTitle: string, goalCat: string) => {
    // Set loading
    setGoals(goals.map(g => g.id === goalId ? { ...g, generatingPlan: true, showRoadmap: true } : g));

    try {
      const roadmapText = await geminiService.generateGoalRoadmap(goalTitle, goalCat);
      
      // Parse markdown checkpoints
      const steps = roadmapText
        .split('\n')
        .filter((line: string) => line.includes('- [ ]') || line.includes('* ') || line.includes('- '))
        .map((line: string) => line.replace('- [ ]', '').replace('*', '').replace('-', '').trim())
        .filter((line: string) => line.length > 2)
        .slice(0, 5); // Take top 5 checkpoints

      setGoals(goals.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            roadmap: steps.length > 0 ? steps : ['Set daily trigger slots', 'Log progress in DeenOS', 'Keep consistency for 21 days'],
            roadmapCompleted: new Array(steps.length || 3).fill(false),
            generatingPlan: false
          };
        }
        return g;
      }));
    } catch (e) {
      console.error(e);
      setGoals(goals.map(g => g.id === goalId ? { ...g, generatingPlan: false } : g));
    }
  };

  return (
    <div className="space-y-6">
      {/* Creation and List layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Goals directory list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
              <Target className="text-primary" size={20} />
              Spiritual Goals Tracker
            </h2>

            <div className="space-y-4">
              {goals.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-12">No goals tracked yet. Add one on the right panel!</p>
              ) : (
                goals.map((g) => {
                  const completedCount = g.roadmapCompleted.filter(Boolean).length;
                  const totalCount = g.roadmap.length;
                  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                  return (
                    <div key={g.id} className="p-4 rounded-xl border border-border-color bg-bg-secondary flex flex-col shadow-sm gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm font-extrabold text-text-primary block">{g.title}</span>
                          <span className="text-[10px] text-text-muted mt-0.5 block uppercase font-bold tracking-widest">{g.category}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleRoadmap(g.id)}
                            className="text-[10px] font-bold px-2 py-1 rounded bg-bg-tertiary border border-border-color text-text-secondary hover:border-primary/20 transition cursor-pointer"
                          >
                            {g.showRoadmap ? 'Hide Plan' : 'Show Plan'}
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(g.id)}
                            className="p-1 text-text-muted hover:text-danger rounded hover:bg-danger/10 transition cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {totalCount > 0 && (
                        <div className="w-full">
                          <div className="w-full h-1.5 rounded-full bg-border-color overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-[9px] text-text-muted mt-1 block font-semibold">{percent}% Action Items Met ({completedCount}/{totalCount})</span>
                        </div>
                      )}

                      {/* Active AI generated checklists */}
                      {g.showRoadmap && (
                        <div className="mt-2 border-t border-border-color/60 pt-3 space-y-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-text-muted uppercase">Roadmap Checklist</span>
                            {g.roadmap.length === 0 && !g.generatingPlan && (
                              <button
                                onClick={() => handleGenerateRoadmap(g.id, g.title, g.category)}
                                className="text-[9px] font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <Sparkles size={10} />
                                Generate AI Checklist
                              </button>
                            )}
                          </div>

                          {g.generatingPlan ? (
                            <div className="flex items-center gap-1.5 py-4 justify-center text-[10px] text-text-muted">
                              <div className="w-3.5 h-3.5 border border-primary border-t-transparent rounded-full animate-spin" />
                              Gemini is creating roadmap...
                            </div>
                          ) : (
                            g.roadmap.map((step, idx) => {
                              const done = g.roadmapCompleted[idx];
                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleToggleStep(g.id, idx)}
                                  className="flex items-start gap-2 w-full text-left py-1 text-xs text-text-secondary hover:text-text-primary transition cursor-pointer"
                                >
                                  {done ? <CheckSquare size={14} className="text-primary shrink-0 mt-0.5" /> : <Square size={14} className="text-text-muted shrink-0 mt-0.5" />}
                                  <span className={done ? 'line-through text-text-muted' : ''}>{step}</span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Goal creator form */}
        <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 h-fit space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Create New Milestone</h3>
          
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-text-secondary block mb-1">Goal / Objective</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Memorize Surah Al-Kahf"
                className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-secondary block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Goal['category'])}
                className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
              >
                <option value="deen">Spiritual (Deen)</option>
                <option value="habits">Habit Mastery</option>
                <option value="finance">Halal Finance</option>
                <option value="reading">Islamic Reading</option>
                <option value="personal">Personal Development</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
            >
              <PlusCircle size={14} />
              Lock Goal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default GoalsPage;
