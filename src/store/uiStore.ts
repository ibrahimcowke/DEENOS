import { create } from 'zustand';
import { changeLanguage } from '../lib/i18n';

interface UIState {
  theme: 'emerald-night' | 'gold-crescent' | 'midnight-sapphire' | 'pearl-light' | 'ramadan-gold';
  isDark: boolean;
  language: 'en' | 'so' | 'ar';
  sidebarCollapsed: boolean;
  ramadanMode: boolean;
  onboarded: boolean;
  onboardingStep: number;
  userProfile: {
    fullName: string;
    goals: string[];
    learningStyle: string;
    reminderPref: string;
  };
  
  // Actions
  setTheme: (theme: UIState['theme']) => void;
  toggleDarkMode: () => void;
  setLanguage: (lang: UIState['language']) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleRamadanMode: () => void;
  setOnboarded: (onboarded: boolean) => void;
  setOnboardingStep: (step: number) => void;
  updateProfile: (profile: Partial<UIState['userProfile']>) => void;
  resetUI: () => void;
}

const getStoredUIState = () => {
  try {
    const data = localStorage.getItem('deenos_ui_state');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return null;
};

const INITIAL_STATE = getStoredUIState() || {
  theme: 'emerald-night',
  isDark: true,
  language: 'en',
  sidebarCollapsed: false,
  ramadanMode: false,
  onboarded: false,
  onboardingStep: 1,
  userProfile: {
    fullName: 'Muslim Brother/Sister',
    goals: [],
    learningStyle: 'visual',
    reminderPref: 'push'
  }
};

export const useUIStore = create<UIState>((set, get) => {
  const saveState = (newState: Partial<UIState>) => {
    const currentState = { ...get(), ...newState };
    const { setTheme, toggleDarkMode, setLanguage, setSidebarCollapsed, toggleRamadanMode, setOnboarded, setOnboardingStep, updateProfile, resetUI, ...dataToSave } = currentState;
    localStorage.setItem('deenos_ui_state', JSON.stringify(dataToSave));
  };

  const syncDOMTheme = (themeName: string, isDarkVal: boolean) => {
    document.documentElement.setAttribute('data-theme', themeName);
    document.documentElement.setAttribute('data-color-scheme', isDarkVal ? 'dark' : 'light');
    
    if (isDarkVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  setTimeout(() => {
    syncDOMTheme(INITIAL_STATE.theme, INITIAL_STATE.isDark);
    changeLanguage(INITIAL_STATE.language);
  }, 50);

  return {
    ...INITIAL_STATE,

    setTheme: (theme: UIState['theme']) => {
      set({ theme });
      syncDOMTheme(theme, get().isDark);
      saveState({ theme });
    },

    toggleDarkMode: () => {
      const nextDark = !get().isDark;
      set({ isDark: nextDark });
      syncDOMTheme(get().theme, nextDark);
      saveState({ isDark: nextDark });
    },

    setLanguage: (language: UIState['language']) => {
      set({ language });
      changeLanguage(language);
      saveState({ language });
    },

    setSidebarCollapsed: (sidebarCollapsed: boolean) => {
      set({ sidebarCollapsed });
      saveState({ sidebarCollapsed });
    },

    toggleRamadanMode: () => {
      const nextRamadan = !get().ramadanMode;
      const nextTheme = nextRamadan ? 'ramadan-gold' : 'emerald-night';
      set({ ramadanMode: nextRamadan, theme: nextTheme });
      syncDOMTheme(nextTheme, get().isDark);
      saveState({ ramadanMode: nextRamadan, theme: nextTheme });
    },

    setOnboarded: (onboarded: boolean) => {
      set({ onboarded });
      saveState({ onboarded });
    },

    setOnboardingStep: (onboardingStep: number) => {
      set({ onboardingStep });
      saveState({ onboardingStep });
    },

    updateProfile: (profile: Partial<UIState['userProfile']>) => {
      const updatedProfile = { ...get().userProfile, ...profile };
      set({ userProfile: updatedProfile });
      saveState({ userProfile: updatedProfile });
    },

    resetUI: () => {
      set({
        theme: 'emerald-night',
        isDark: true,
        language: 'en',
        sidebarCollapsed: false,
        ramadanMode: false,
        onboarded: false,
        onboardingStep: 1,
        userProfile: {
          fullName: 'Muslim Brother/Sister',
          goals: [],
          learningStyle: 'visual',
          reminderPref: 'push'
        }
      });
      localStorage.removeItem('deenos_ui_state');
      syncDOMTheme('emerald-night', true);
      changeLanguage('en');
    }
  };
});
