import React, { useState, useEffect, useRef } from 'react';
import { useGoalStore } from '../store/goalStore';
import type { Goal } from '../store/goalStore';
import { Target, PlusCircle, Sparkles, CheckSquare, Square, Trash2, Calendar } from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const {
    goals, syncGoalsData, addGoal, deleteGoal,
    toggleGoalRoadmap, toggleGoalStep, generateGoalRoadmap
  } = useGoalStore();

  useEffect(() => {
    syncGoalsData();
  }, []);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Goal['category']>('deen');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Goal['priority']>('medium');

  const getDaysLeft = (deadlineStr?: string) => {
    if (!deadlineStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(deadlineStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGoal(title, category, deadline || undefined, priority);
    setTitle('');
    setDeadline('');
    setPriority('medium');
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
  };

  const handleToggleRoadmap = (goalId: string) => {
    toggleGoalRoadmap(goalId);
  };

  const handleToggleStep = (goalId: string, stepIdx: number) => {
    toggleGoalStep(goalId, stepIdx);
  };

  const handleGenerateRoadmap = async (goalId: string, goalTitle: string, goalCat: string) => {
    generateGoalRoadmap(goalId, goalTitle, goalCat);
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-extrabold text-text-primary">{g.title}</span>
                            {g.priority && (
                              <span className={`text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded border ${
                                g.priority === 'high'
                                  ? 'bg-red-500/15 border-red-500/30 text-red-500'
                                  : g.priority === 'medium'
                                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                                  : 'bg-blue-500/15 border-blue-500/30 text-blue-500'
                              }`}>
                                {g.priority}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">{g.category}</span>
                            {g.deadline && (() => {
                              const daysLeft = getDaysLeft(g.deadline);
                              if (daysLeft === null) return null;
                              return (
                                <span className={`text-[9px] font-extrabold ${
                                  daysLeft < 0 
                                    ? 'text-red-500' 
                                    : daysLeft === 0 
                                    ? 'text-amber-500' 
                                    : 'text-success'
                                }`}>
                                  • {daysLeft < 0 
                                    ? `Overdue by ${Math.abs(daysLeft)}d` 
                                    : daysLeft === 0 
                                    ? 'Due Today' 
                                    : `${daysLeft}d left`}
                                </span>
                              );
                            })()}
                          </div>
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
        <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 h-fit space-y-4 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <Target className="text-primary animate-pulse" size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Create New Milestone</h3>
          </div>
          
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-text-secondary block mb-1.5 uppercase tracking-wider">Goal / Objective</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Memorize Surah Al-Kahf"
                className="w-full border border-border-color rounded-xl px-3.5 py-2.5 text-xs bg-bg-primary/50 focus:outline-none focus:border-primary text-text-primary focus:ring-1 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-secondary block mb-1.5 uppercase tracking-wider">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'deen' as const, label: 'Deen', icon: '🕌' },
                  { key: 'habits' as const, label: 'Habits', icon: '⚡' },
                  { key: 'finance' as const, label: 'Finance', icon: '💰' },
                  { key: 'reading' as const, label: 'Reading', icon: '📖' },
                  { key: 'personal' as const, label: 'Personal', icon: '🌱' }
                ].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition duration-200 cursor-pointer flex items-center gap-2 ${
                      category === cat.key
                        ? 'bg-primary/10 border-primary text-primary font-black shadow-sm'
                        : 'bg-bg-primary/30 border-border-color text-text-secondary hover:border-text-muted hover:bg-bg-primary/50'
                    }`}
                  >
                    <span className="text-sm">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] font-bold text-text-secondary block mb-1.5 uppercase tracking-wider">Target Date</label>
                <div 
                  onClick={() => dateInputRef.current?.showPicker()}
                  className="w-full border border-border-color rounded-xl px-3 py-2.5 bg-bg-primary/30 flex items-center justify-between cursor-pointer focus-within:border-primary focus-within:bg-bg-primary/50 transition-all duration-200 hover:border-text-muted"
                >
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-transparent border-0 p-0 text-xs text-text-primary focus:outline-none cursor-pointer"
                  />
                  <Calendar size={14} className="text-text-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-secondary block mb-1.5 uppercase tracking-wider">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'low' as const, label: 'Low', activeColor: 'bg-blue-500/15 border-blue-500 text-blue-400 font-extrabold shadow-sm' },
                    { key: 'medium' as const, label: 'Medium', activeColor: 'bg-amber-500/15 border-amber-500 text-amber-400 font-extrabold shadow-sm' },
                    { key: 'high' as const, label: 'High', activeColor: 'bg-red-500/15 border-red-500 text-red-400 font-extrabold shadow-sm' }
                  ].map((prio) => (
                    <button
                      key={prio.key}
                      type="button"
                      onClick={() => setPriority(prio.key)}
                      className={`py-2 px-1 rounded-xl border text-[11px] text-center transition duration-200 cursor-pointer ${
                        priority === prio.key
                          ? prio.activeColor
                          : 'bg-bg-primary/30 border-border-color text-text-secondary hover:border-text-muted hover:bg-bg-primary/50'
                      }`}
                    >
                      {prio.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 hover:scale-[1.01] hover:shadow-orange-500/20 active:scale-[0.99] mt-6 cursor-pointer"
            >
              <PlusCircle size={15} />
              Lock Goal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default GoalsPage;
