import React from 'react';
import { useUIStore } from '../store/uiStore';
import { useDeenStore } from '../store/deenStore';
import { useHabitStore } from '../store/habitStore';
import { useFinanceStore } from '../store/financeStore';
import { User, Award, Globe, Paintbrush, Moon, ShieldAlert, Check } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { 
    theme, setTheme, isDark, toggleDarkMode, language, setLanguage, userProfile, updateProfile, resetUI 
  } = useUIStore();

  const { achievements, resetAll } = useDeenStore();
  const { resetHabits } = useHabitStore();
  const { resetFinance } = useFinanceStore();

  const handleLanguageChange = (lang: 'en' | 'so' | 'ar') => {
    setLanguage(lang);
  };

  const handleFullReset = () => {
    const doubleCheck = window.confirm('Are you absolutely sure you want to delete all local deen state, logs, habits, and finance metrics? This action is irreversible.');
    if (doubleCheck) {
      resetAll();
      resetHabits();
      resetFinance();
      resetUI();
      window.location.reload();
    }
  };

  const themeOptions = [
    { id: 'emerald-night', name: 'Emerald Night', color: 'bg-[#10b981]' },
    { id: 'gold-crescent', name: 'Gold Crescent', color: 'bg-[#c29845]' },
    { id: 'midnight-sapphire', name: 'Midnight Sapphire', color: 'bg-[#2563eb]' },
    { id: 'pearl-light', name: 'Pearl Light', color: 'bg-[#a3a3a3]' },
    { id: 'ramadan-gold', name: 'Ramadan Gold', color: 'bg-[#d97706]' }
  ] as const;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* 1. Account Settings Card */}
      <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-4">
        <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
          <User className="text-primary" size={18} />
          Profile Configuration
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">Servant Name</label>
            <input
              type="text"
              value={userProfile.fullName}
              onChange={(e) => updateProfile({ fullName: e.target.value })}
              className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">Timezone Location</label>
            <input
              type="text"
              defaultValue="East Africa Time (EAT) +03:00"
              disabled
              className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-tertiary text-text-muted cursor-default"
            />
          </div>
        </div>
      </div>

      {/* 2. Theme & Customization */}
      <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-4">
        <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
          <Paintbrush className="text-primary" size={18} />
          Visual Customization
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Active theme select */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-text-secondary block">Select Design Theme</span>
            <div className="flex flex-col gap-2">
              {themeOptions.map((opt) => {
                const isActive = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left flex justify-between items-center transition cursor-pointer ${
                      isActive
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-bg-secondary border-border-color text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${opt.color}`} />
                      <span>{opt.name}</span>
                    </div>
                    {isActive && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lang select */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-text-secondary block flex items-center gap-1">
              <Globe size={13} />
              System Language
            </span>
            <div className="flex flex-col gap-2">
              {(['en', 'so', 'ar'] as const).map((lang) => {
                const isActive = language === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left flex justify-between items-center transition cursor-pointer ${
                      isActive
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-bg-secondary border-border-color text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    <span>
                      {lang === 'en' && '🇺🇸 English'}
                      {lang === 'so' && '🇸🇴 Somali'}
                      {lang === 'ar' && '🇸🇦 العربية'}
                    </span>
                    {isActive && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dark Mode toggle */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-text-secondary block flex items-center gap-1">
              <Moon size={13} />
              Color Scheme Mode
            </span>
            <button
              onClick={toggleDarkMode}
              className="w-full p-4 rounded-xl border border-border-color bg-bg-secondary flex justify-between items-center text-xs font-bold text-text-primary hover:border-primary/20 transition cursor-pointer"
            >
              <span>{isDark ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}</span>
              <span className="text-[10px] text-primary underline">Toggle</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Achievements Badge Grid */}
      <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-4">
        <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
          <Award className="text-primary" size={18} />
          Unlocked Achievements
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border flex flex-col items-center justify-between text-center transition ${
                ach.unlocked
                  ? 'bg-primary/5 border-primary/20 text-text-primary'
                  : 'bg-bg-secondary/40 border-border-color/60 text-text-muted opacity-50'
              }`}
            >
              <span className="text-3xl filter saturate-[0.8] mb-2">{ach.badge}</span>
              <div>
                <span className="text-xs font-bold block">{ach.name}</span>
                <span className="text-[9px] text-text-secondary mt-1 block leading-tight">{ach.description}</span>
              </div>
              <span className="text-[9px] font-bold text-primary mt-2">+{ach.xpReward} XP</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Danger Zone */}
      <div className="glass-card border border-red-500/20 rounded-2xl p-6 bg-red-500/5 space-y-4">
        <h3 className="text-base font-extrabold text-danger flex items-center gap-2">
          <ShieldAlert size={18} />
          Danger Zone
        </h3>
        <p className="text-xs text-text-secondary">Wiping local databases clears all daily logs, habit history, subscriptions, and profile names cached on this browser.</p>
        <button
          onClick={handleFullReset}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
        >
          Reset All DeenOS Cache
        </button>
      </div>
    </div>
  );
};
export default ProfilePage;
