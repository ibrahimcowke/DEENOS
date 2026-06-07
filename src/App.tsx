import { useState, useEffect } from 'react';
import { useUIStore } from './store/uiStore';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { Login } from './pages/Login';
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
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('deenos_user_authenticated') === 'true'
  );
  const [activeTab, setActiveTab] = useState('dashboard');

  // Handle custom auth updates from other pages
  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(localStorage.getItem('deenos_user_authenticated') === 'true');
    };
    window.addEventListener('deenos_auth_change', handleAuthChange);
    return () => window.removeEventListener('deenos_auth_change', handleAuthChange);
  }, []);

  // Sync data with Supabase DDL on load
  useEffect(() => {
    if (isAuthenticated && onboarded) {
      useDeenStore.getState().syncSpiritualData();
      useHabitStore.getState().syncHabitsData();
      useFinanceStore.getState().syncFinanceData();
    }
  }, [isAuthenticated, onboarded]);

  // 1. Auth Routing
  if (!isAuthenticated) {
    return <Login />;
  }

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
