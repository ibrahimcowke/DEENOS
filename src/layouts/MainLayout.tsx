import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { useDeenStore } from '../store/deenStore';
import { 
  LayoutDashboard, BookOpen, Compass, Leaf, Wallet, Target, PenTool, 
  MessageSquare, Moon, Sun, Globe, MoonStar, Settings, ChevronLeft, ChevronRight, Bell, Sparkles,
  Users
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { t } = useTranslation();
  const { 
    theme, setTheme, isDark, toggleDarkMode, language, setLanguage, 
    sidebarCollapsed, setSidebarCollapsed, ramadanMode, toggleRamadanMode, userProfile 
  } = useUIStore();

  const { level, xp } = useDeenStore();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: t('common.dashboard'), icon: LayoutDashboard },
    { id: 'salah', label: t('common.salah'), icon: MoonStar },
    { id: 'quran', label: t('common.quran'), icon: BookOpen },
    { id: 'dhikr', label: t('common.dhikr'), icon: Compass },
    { id: 'habits', label: t('common.habits'), icon: Leaf },
    { id: 'finances', label: t('common.finances'), icon: Wallet },
    { id: 'goals', label: t('common.goals'), icon: Target },
    { id: 'journal', label: t('common.journal'), icon: PenTool },
    { id: 'ai-coach', label: t('common.ai_coach'), icon: MessageSquare },
    { id: 'circles', label: t('common.circles') || 'Circles', icon: Users }
  ];

  const themeOptions = [
    { id: 'emerald-night', name: 'Emerald Night', color: 'bg-[#10b981]' },
    { id: 'gold-crescent', name: 'Gold Crescent', color: 'bg-[#c29845]' },
    { id: 'midnight-sapphire', name: 'Midnight Sapphire', color: 'bg-[#2563eb]' },
    { id: 'pearl-light', name: 'Pearl Light', color: 'bg-[#a3a3a3]' },
    { id: 'ramadan-gold', name: 'Ramadan Gold', color: 'bg-[#d97706]' },
    { id: 'pure-white', name: 'Pure White', color: 'bg-[#ffffff] border border-border-color/40' }
  ] as const;

  const handleLanguageChange = (lang: 'en' | 'so' | 'ar') => {
    setLanguage(lang);
    setShowLangDropdown(false);
  };

  const getActiveTabTitle = () => {
    const item = navItems.find((n) => n.id === activeTab);
    if (activeTab === 'ramadan') return t('common.ramadan');
    if (activeTab === 'profile') return t('common.profile');
    return item ? item.label : 'DEENOS™';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary select-none text-text-primary">
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside 
        className={`hidden md:flex glass border-r border-border-color flex-col h-full transition-all duration-300 z-30 shrink-0 relative ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Sidebar Header Brand */}
        <div className="p-4 flex items-center justify-between border-b border-border-color">
          <div className="flex items-center gap-2 overflow-hidden">
            <img src="/logo.png" alt="DeenOs Logo" className="w-8 h-8 rounded-xl shrink-0 shadow object-cover" />
            {!sidebarCollapsed && (
              <span className="font-black tracking-tighter text-lg bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
                DEENOS™
              </span>
            )}
          </div>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Level and XP Badge under Header */}
        {!sidebarCollapsed && (
          <div className="p-4 mx-3 my-2 rounded-xl bg-bg-tertiary/60 border border-border-color/60 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-extrabold text-text-muted tracking-widest">Active Level</span>
              <span className="text-sm font-black text-text-primary">Level {level}</span>
            </div>
            <div className="h-6 w-0.5 bg-border-color" />
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-extrabold text-text-muted tracking-widest">Total XP</span>
              <span className="text-sm font-black text-primary">{xp} XP</span>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center w-full px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-white shadow' 
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`}
              >
                <Icon size={18} className={sidebarCollapsed ? 'mx-auto' : 'mr-3 rtl:ml-3'} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          {/* Ramadan Special Tab link */}
          <button
            onClick={() => setActiveTab('ramadan')}
            className={`flex items-center w-full px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === 'ramadan' 
                ? 'bg-amber-600 text-white shadow' 
                : ramadanMode 
                  ? 'text-amber-500 hover:bg-amber-500/10' 
                  : 'text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            <MoonStar size={18} className={sidebarCollapsed ? 'mx-auto text-amber-500' : 'mr-3 rtl:ml-3 text-amber-500'} />
            {!sidebarCollapsed && (
              <div className="flex justify-between items-center w-full">
                <span>{t('common.ramadan')}</span>
                {ramadanMode && <span className="bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">Live</span>}
              </div>
            )}
          </button>
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-border-color bg-bg-tertiary/40 space-y-3">
          {/* Theme circles row */}
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-text-muted uppercase">Themes</span>
              <div className="flex gap-1">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`w-3.5 h-3.5 rounded-full border cursor-pointer hover:scale-110 transition ${opt.color} ${
                      theme === opt.id ? 'border-text-primary scale-110' : 'border-transparent'
                    }`}
                    title={opt.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Settings / Controls Column */}
          <div className="flex flex-col gap-1">
            {/* Dark Mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center w-full px-2.5 py-2 rounded-lg hover:bg-bg-primary text-text-secondary hover:text-text-primary transition text-xs font-semibold cursor-pointer"
            >
              {isDark ? <Sun size={16} className={sidebarCollapsed ? 'mx-auto' : 'mr-2.5'} /> : <Moon size={16} className={sidebarCollapsed ? 'mx-auto' : 'mr-2.5'} />}
              {!sidebarCollapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>

            {/* Language switch button */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center w-full px-2.5 py-2 rounded-lg hover:bg-bg-primary text-text-secondary hover:text-text-primary transition text-xs font-semibold cursor-pointer"
              >
                <Globe size={16} className={sidebarCollapsed ? 'mx-auto' : 'mr-2.5'} />
                {!sidebarCollapsed && (
                  <div className="flex justify-between w-full items-center">
                    <span className="uppercase">{language}</span>
                    <span className="text-[9px] text-text-muted">Change</span>
                  </div>
                )}
              </button>
              
              {/* Dropdown popup */}
              {showLangDropdown && (
                <div className={`absolute bottom-full left-2 right-2 mb-1 rounded-xl glass border border-border-color p-1.5 shadow-xl flex flex-col gap-1 z-50 ${sidebarCollapsed ? 'w-24 left-14' : ''}`}>
                  <button onClick={() => handleLanguageChange('en')} className="text-left text-[11px] font-bold p-1.5 hover:bg-primary/10 rounded hover:text-primary transition">English</button>
                  <button onClick={() => handleLanguageChange('so')} className="text-left text-[11px] font-bold p-1.5 hover:bg-primary/10 rounded hover:text-primary transition">Somali</button>
                  <button onClick={() => handleLanguageChange('ar')} className="text-left text-[11px] font-bold p-1.5 hover:bg-primary/10 rounded hover:text-primary transition">العربية</button>
                </div>
              )}
            </div>

            {/* Profile page tab */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center w-full px-2.5 py-2 rounded-lg transition text-xs font-semibold cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
              }`}
            >
              <Settings size={16} className={sidebarCollapsed ? 'mx-auto' : 'mr-2.5'} />
              {!sidebarCollapsed && <span>{t('common.profile')}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* CORE CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Workspace Top Header Bar */}
        <header className="h-14 border-b border-border-color bg-bg-secondary/40 backdrop-blur px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold tracking-tight text-text-primary truncate max-w-[140px] sm:max-w-none">
              {getActiveTabTitle()}
            </h1>
            {!isOnline && (
              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse shadow-sm">
                ⚠️ Local Offline Mode
              </span>
            )}
            {ramadanMode && (
              <span className="bg-amber-600/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:flex items-center gap-1">
                🌙 Ramadan Gold Theme
              </span>
            )}
          </div>

          {/* Profile Badge & Notification center */}
          <div className="flex items-center gap-4">
            {/* Ramadan fast toggle shortcut */}
            <button 
              onClick={toggleRamadanMode}
              className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer hover:scale-105 ${
                ramadanMode 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                  : 'bg-bg-secondary border-border-color text-text-secondary hover:border-primary'
              }`}
            >
              <MoonStar size={14} className={ramadanMode ? 'animate-pulse' : ''} />
              <span className="hidden sm:inline">Ramadan Mode</span>
            </button>

            {/* Notification center */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                className="p-2 rounded-xl border border-border-color hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition cursor-pointer relative"
              >
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger ring-2 ring-bg-secondary" />
              </button>
              
              {/* Notifications dropdown panel */}
              {showNotificationDrawer && (
                <div className="absolute right-0 mt-2 w-80 glass border border-border-color rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-3 duration-250">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted">System Messages</span>
                    <button 
                      onClick={() => setShowNotificationDrawer(false)}
                      className="text-[10px] text-primary font-bold hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-bg-primary transition text-xs border border-border-color bg-bg-secondary">
                      <Sparkles className="text-primary mt-0.5 shrink-0" size={14} />
                      <div>
                        <span className="font-bold block text-text-primary">XP Goal Met!</span>
                        <span className="text-text-secondary block mt-0.5">Masha'Allah! You logged 10 Dhikr reps and earned 10 XP points.</span>
                        <span className="text-[9px] text-text-muted mt-1 block">Just now</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-bg-primary transition text-xs border border-border-color bg-bg-secondary">
                      <MoonStar className="text-amber-500 mt-0.5 shrink-0" size={14} />
                      <div>
                        <span className="font-bold block text-text-primary">Asr Prayer Incoming</span>
                        <span className="text-text-secondary block mt-0.5">Asr prayer starts in 45 minutes. Prepare your Wudu.</span>
                        <span className="text-[9px] text-text-muted mt-1 block">30 mins ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Trigger */}
            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 border border-border-color rounded-xl p-1 pr-3 hover:bg-bg-tertiary transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-extrabold text-xs">
                {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'M'}
              </div>
              <span className="text-xs font-bold text-text-secondary hidden md:inline truncate max-w-[100px]">
                {userProfile.fullName}
              </span>
            </button>
          </div>
        </header>

        {/* Content View Area */}
        <section className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 relative">
          {children}
        </section>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 h-16 rounded-2xl glass border border-border-color/60 shadow-xl flex items-center justify-around px-2 z-40 animate-in slide-in-from-bottom-2 duration-300">
        {/* Dashboard */}
        <button 
          onClick={() => { setActiveTab('dashboard'); setShowMobileMore(false); }}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${activeTab === 'dashboard' ? 'text-primary' : 'text-text-secondary'}`}
        >
          <LayoutDashboard size={18} />
          <span className="text-[9px] font-bold mt-1">Home</span>
        </button>
        
        {/* Salah */}
        <button 
          onClick={() => { setActiveTab('salah'); setShowMobileMore(false); }}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${activeTab === 'salah' ? 'text-primary' : 'text-text-secondary'}`}
        >
          <MoonStar size={18} />
          <span className="text-[9px] font-bold mt-1">Salah</span>
        </button>
        
        {/* Quran */}
        <button 
          onClick={() => { setActiveTab('quran'); setShowMobileMore(false); }}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${activeTab === 'quran' ? 'text-primary' : 'text-text-secondary'}`}
        >
          <BookOpen size={18} />
          <span className="text-[9px] font-bold mt-1">Quran</span>
        </button>
        
        {/* Dhikr */}
        <button 
          onClick={() => { setActiveTab('dhikr'); setShowMobileMore(false); }}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${activeTab === 'dhikr' ? 'text-primary' : 'text-text-secondary'}`}
        >
          <Compass size={18} />
          <span className="text-[9px] font-bold mt-1">Dhikr</span>
        </button>
        
        {/* More Menu */}
        <button 
          onClick={() => setShowMobileMore(!showMobileMore)}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${showMobileMore ? 'text-primary' : 'text-text-secondary'}`}
        >
          <Sparkles size={18} className={showMobileMore ? 'animate-spin-slow text-primary' : ''} />
          <span className="text-[9px] font-bold mt-1">More</span>
        </button>
      </div>

      {/* MOBILE "MORE" OVERLAY SHEET */}
      {showMobileMore && (
        <>
          {/* Background Backdrop overlay */}
          <div 
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-all"
            onClick={() => setShowMobileMore(false)}
          />
          {/* Bottom Sheet Menu */}
          <div className="md:hidden fixed bottom-24 left-4 right-4 rounded-3xl glass border border-border-color p-5 shadow-2xl z-40 flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-border-color/60">
              <span className="text-xs font-black uppercase tracking-wider text-text-muted">More Features</span>
              <span className="text-[10px] text-primary font-bold">Level {level} • {xp} XP</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {/* Habits */}
              <button
                onClick={() => { setActiveTab('habits'); setShowMobileMore(false); }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition cursor-pointer ${
                  activeTab === 'habits' ? 'bg-primary/10 border-primary text-primary' : 'bg-bg-primary/40 border-border-color text-text-secondary'
                }`}
              >
                <Leaf size={18} />
                <span className="text-[10px] font-extrabold mt-1.5">Habits</span>
              </button>
              
              {/* Finances */}
              <button
                onClick={() => { setActiveTab('finances'); setShowMobileMore(false); }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition cursor-pointer ${
                  activeTab === 'finances' ? 'bg-primary/10 border-primary text-primary' : 'bg-bg-primary/40 border-border-color text-text-secondary'
                }`}
              >
                <Wallet size={18} />
                <span className="text-[10px] font-extrabold mt-1.5">Finances</span>
              </button>
              
              {/* Goals */}
              <button
                onClick={() => { setActiveTab('goals'); setShowMobileMore(false); }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition cursor-pointer ${
                  activeTab === 'goals' ? 'bg-primary/10 border-primary text-primary' : 'bg-bg-primary/40 border-border-color text-text-secondary'
                }`}
              >
                <Target size={18} />
                <span className="text-[10px] font-extrabold mt-1.5">Goals</span>
              </button>
              
              {/* Journal */}
              <button
                onClick={() => { setActiveTab('journal'); setShowMobileMore(false); }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition cursor-pointer ${
                  activeTab === 'journal' ? 'bg-primary/10 border-primary text-primary' : 'bg-bg-primary/40 border-border-color text-text-secondary'
                }`}
              >
                <PenTool size={18} />
                <span className="text-[10px] font-extrabold mt-1.5">Journal</span>
              </button>
              
              {/* AI Coach */}
              <button
                onClick={() => { setActiveTab('ai-coach'); setShowMobileMore(false); }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition cursor-pointer ${
                  activeTab === 'ai-coach' ? 'bg-primary/10 border-primary text-primary' : 'bg-bg-primary/40 border-border-color text-text-secondary'
                }`}
              >
                <MessageSquare size={18} />
                <span className="text-[10px] font-extrabold mt-1.5">AI Coach</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => { setActiveTab('profile'); setShowMobileMore(false); }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition cursor-pointer ${
                  activeTab === 'profile' ? 'bg-primary/10 border-primary text-primary' : 'bg-bg-primary/40 border-border-color text-text-secondary'
                }`}
              >
                <Settings size={18} />
                <span className="text-[10px] font-extrabold mt-1.5">Settings</span>
              </button>
            </div>

            {/* Theme selector inside sheet */}
            <div className="pt-2 border-t border-border-color/60 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-text-muted">Select Theme</span>
              <div className="flex gap-1.5">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`w-5 h-5 rounded-full border cursor-pointer hover:scale-110 transition ${opt.color} ${
                      theme === opt.id ? 'border-text-primary scale-110' : 'border-transparent'
                    }`}
                    title={opt.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default MainLayout;
