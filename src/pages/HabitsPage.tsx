import React, { useState } from 'react';
import { useHabitStore } from '../store/habitStore';
import type { Habit } from '../store/habitStore';
import { SpiritualGarden } from '../components/SpiritualGarden';
import { Leaf, Plus, Trash2, HelpCircle, Sparkles, Droplet } from 'lucide-react';

export const HabitsPage: React.FC = () => {
  const { habits, addHabit, deleteHabit, logHabit, getPlantLevel, getPlantStatus } = useHabitStore();

  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Habit['category']>('worship');
  const [frequency, setFrequency] = useState<Habit['frequency']>('daily');
  const [plantType, setPlantType] = useState<Habit['plantType']>('flower');
  const [showAddForm, setShowAddForm] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const selectedHabit = habits.find(h => h.id === (selectedHabitId || habits[0]?.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addHabit(name, category, frequency, plantType);
    setName('');
    setShowAddForm(false);
  };

  const categories = [
    { value: 'worship', label: 'Worship' },
    { value: 'health', label: 'Health' },
    { value: 'learning', label: 'Learning' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'finance', label: 'Finance' },
    { value: 'family', label: 'Family' },
    { value: 'custom', label: 'Custom' }
  ];

  const plantTypes = [
    { value: 'flower', label: 'Flower' },
    { value: 'tree', label: 'Tree' },
    { value: 'fern', label: 'Fern' },
    { value: 'cactus', label: 'Cactus' },
    { value: 'sunflower', label: 'Sunflower' },
    { value: 'rose', label: 'Rose' }
  ];

  return (
    <div className="space-y-6">
      {/* Top section: Garden and creation control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Garden view (takes 2 cols) */}
        <div className="lg:col-span-2">
          <SpiritualGarden />
        </div>

        {/* Sidebar Column */}
        <div className="flex flex-col gap-6">
          {/* Create Habit panel */}
          <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Leaf className="text-primary" size={18} />
                Garden Directory
              </h3>
              
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="p-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white transition flex items-center gap-1 cursor-pointer text-xs font-bold"
              >
                <Plus size={14} />
                New Plant
              </button>
            </div>

            {showAddForm ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Habit / Plant Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Recite Morning Adhkar"
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Habit['category'])}
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as Habit['frequency'])}
                      className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Plant Flora</label>
                    <select
                      value={plantType}
                      onChange={(e) => setPlantType(e.target.value as Habit['plantType'])}
                      className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
                    >
                      {plantTypes.map((pt) => (
                        <option key={pt.value} value={pt.value}>{pt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition"
                  >
                    Plant Habit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-2 border border-border-color hover:bg-bg-tertiary rounded-xl text-xs font-semibold text-text-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* Simple directory of current habit list */
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {habits.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-8">No active plants in directory.</p>
                ) : (
                  habits.map((habit) => {
                    const isSelected = selectedHabit?.id === habit.id;
                    return (
                      <div 
                        key={habit.id} 
                        onClick={() => setSelectedHabitId(habit.id)}
                        className={`p-3 rounded-xl border flex justify-between items-center shadow-sm transition cursor-pointer ${
                          isSelected
                            ? 'bg-primary/5 border-primary shadow-md shadow-primary/5'
                            : 'border-border-color bg-bg-secondary hover:border-primary/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {habit.plantType === 'tree' ? '🌲' : habit.plantType === 'rose' ? '🌹' : habit.plantType === 'cactus' ? '🌵' : '🌱'}
                          </span>
                          <div>
                            <span className="text-xs font-bold block text-text-primary max-w-[120px] truncate">{habit.name}</span>
                            <span className="text-[10px] text-text-muted capitalize">{habit.category} • Streak: {habit.currentStreak}d</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedHabitId === habit.id) setSelectedHabitId(null);
                            deleteHabit(habit.id);
                          }}
                          className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition cursor-pointer"
                          title="Uproot Habit"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-border-color/60 pt-4 flex items-start gap-1.5 text-[10px] text-text-muted">
            <HelpCircle size={12} className="shrink-0 mt-0.5" />
            <span>Streaks increase plant size levels. Wilted status triggers if habits remain unwatered for more than 48 hours.</span>
          </div>
        </div>

        {/* Flora Growth Detail Card */}
        {selectedHabit ? (
          <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">
                {selectedHabit.plantType === 'tree' ? '🌲' : selectedHabit.plantType === 'rose' ? '🌹' : selectedHabit.plantType === 'cactus' ? '🌵' : '🌱'}
              </span>
              <div>
                <h4 className="text-sm font-extrabold text-text-primary">{selectedHabit.name}</h4>
                <span className="text-[10px] text-text-muted capitalize">{selectedHabit.category} Plant</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-bg-primary/30 p-3 rounded-xl border border-border-color/60 text-[10px]">
              <div>
                <span className="text-text-muted block font-medium">Growth Stage</span>
                <span className="text-text-primary font-bold capitalize block mt-0.5 text-[10px]">
                  {getPlantStatus(selectedHabit)} (Lvl {getPlantLevel(selectedHabit)}/5)
                </span>
              </div>
              <div>
                <span className="text-text-muted block font-medium">Watering Status</span>
                {selectedHabit.lastCompletedDate === today ? (
                  <span className="text-success font-black block mt-0.5 flex items-center gap-0.5">
                    <Droplet size={10} className="fill-success animate-bounce" /> Watered Today
                  </span>
                ) : (
                  <span className="text-warning font-black block mt-0.5">
                    Needs Water 🚿
                  </span>
                )}
              </div>
              <div>
                <span className="text-text-muted block font-medium">Active Streak</span>
                <span className="text-text-primary font-bold block mt-0.5">{selectedHabit.currentStreak} days</span>
              </div>
              <div>
                <span className="text-text-muted block font-medium">Max Streak</span>
                <span className="text-text-primary font-bold block mt-0.5">{selectedHabit.maxStreak} days</span>
              </div>
            </div>

            {selectedHabit.lastCompletedDate !== today ? (
              <button
                onClick={() => logHabit(selectedHabit.id, 'completed', today)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
              >
                <Droplet size={14} className="fill-white animate-pulse" />
                Water Plant (Log Complete)
              </button>
            ) : (
              <div className="w-full py-2 bg-success/15 border border-success/20 text-success rounded-xl text-[10px] font-bold text-center flex items-center justify-center gap-1">
                <Droplet size={12} className="fill-success" />
                Your plant is perfectly hydrated!
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 text-center py-8">
            <span className="text-2xl block mb-2">🪴</span>
            <p className="text-xs text-text-muted">Create or select a habit to nurture and watch its flora grow!</p>
          </div>
        )}
      </div>
    </div>

    {/* AI Habit Insights Panel */}
      <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-accent/15 border border-accent/20 text-accent shrink-0">
          <Sparkles size={24} />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-text-primary">Gemini AI Garden Insights</h3>
          <p className="text-xs text-text-secondary leading-relaxed mt-1">
            "Your <strong>Read Quran 5 Pages</strong> habit is on a 3-day streak, maintaining a strong healthy Tree. To build more consistency for <strong>Walk 10k Steps</strong>, stack it after your Dhuhr prayer walk to keep your Sunflower well-watered."
          </p>
        </div>
      </div>
    </div>
  );
};
export default HabitsPage;
