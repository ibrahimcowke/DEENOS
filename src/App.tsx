import { useState, useEffect } from 'react';
import { useUIStore } from './store/uiStore';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { SalahTracker } from './pages/SalahTracker';
import { QuranTracker } from './pages/QuranTracker';
import { DhikrPage } from './pages/DhikrPage';
import { HabitsPage } from './pages/HabitsPage';
import { FinanceHub } from './pages/FinanceHub';
import { GoalsPage } from './pages/GoalsPage';
import { JournalPage } from './pages/JournalPage';
import { AICoachPage } from './pages/AICoachPage';
import { RamadanPage } from './pages/RamadanPage';
import { ProfilePage } from './pages/ProfilePage';

import { useDeenStore } from './store/deenStore';
import { useHabitStore } from './store/habitStore';
import { useFinanceStore } from './store/financeStore';

function App() {
  const { onboarded } = useUIStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sync data with Supabase DDL on load
  useEffect(() => {
    if (onboarded) {
      useDeenStore.getState().syncSpiritualData();
      useHabitStore.getState().syncHabitsData();
      useFinanceStore.getState().syncFinanceData();
    }
  }, [onboarded]);


  // 2. Onboarding Routing
  if (!onboarded) {
    return <Onboarding />;
  }

  // 3. Main Application Tab Routing
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'salah':
        return <SalahTracker />;
      case 'quran':
        return <QuranTracker />;
      case 'dhikr':
        return <DhikrPage />;
      case 'habits':
        return <HabitsPage />;
      case 'finances':
        return <FinanceHub />;
      case 'goals':
        return <GoalsPage />;
      case 'journal':
        return <JournalPage />;
      case 'ai-coach':
        return <AICoachPage />;
      case 'ramadan':
        return <RamadanPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </MainLayout>
  );
}

export default App;
