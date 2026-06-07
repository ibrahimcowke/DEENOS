import React from 'react';
import { useUIStore } from '../store/uiStore';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Onboarding: React.FC = () => {
  const { t } = useTranslation();
  const { onboardingStep, setOnboardingStep, language, setLanguage, setOnboarded, userProfile, updateProfile } = useUIStore();

  const handleNextStep = () => {
    if (onboardingStep < 4) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setOnboarded(true);
    }
  };

  const handleBackStep = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  // Step 2 Goals configuration
  const goalsOptions = [
    { key: 'consistent_salah', label: t('onboarding.consistent_salah'), emoji: '🕌' },
    { key: 'quran_reading', label: t('onboarding.quran_reading'), emoji: '📖' },
    { key: 'memorization', label: t('onboarding.memorization'), emoji: '🧠' },
    { key: 'productivity', label: t('onboarding.productivity'), emoji: '⚡' },
    { key: 'charity', label: t('onboarding.charity'), emoji: '💝' },
    { key: 'better_habits', label: t('onboarding.better_habits'), emoji: '🌿' },
    { key: 'financial_discipline', label: t('onboarding.financial_discipline'), emoji: '💰' }
  ];

  const toggleGoalSelection = (goalKey: string) => {
    const activeGoals = userProfile.goals;
    if (activeGoals.includes(goalKey)) {
      updateProfile({ goals: activeGoals.filter((g) => g !== goalKey) });
    } else {
      updateProfile({ goals: [...activeGoals, goalKey] });
    }
  };

  // Onboarding Screen Renderers
  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 relative overflow-hidden bg-bg-primary">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-3xl bg-primary/10 animate-float" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-3xl bg-accent/10 animate-pulse-slow" />

      {/* Main Glassmorphic Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl glass border border-border-color rounded-3xl p-8 shadow-2xl relative flex flex-col min-h-[460px] justify-between z-10"
      >
        {/* Step Indicator dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                onboardingStep === step ? 'w-8 bg-primary' : 'w-2.5 bg-border-color'
              }`}
            />
          ))}
        </div>

        {/* ==========================================================
            STEP 1: WELCOME SCREEN
            ========================================================== */}
        {onboardingStep === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center flex-1 flex flex-col justify-center py-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center mx-auto mb-6 text-white font-black text-2xl shadow-lg animate-bounce">
              D
            </div>
            <h2 className="text-3xl font-black text-text-primary tracking-tight md:text-4xl leading-tight">
              {t('onboarding.welcome_title')}
            </h2>
            <p className="text-sm text-text-secondary mt-4 leading-relaxed max-w-md mx-auto">
              {t('onboarding.welcome_subtitle')}
            </p>

            <div className="mt-6">
              <label className="text-xs font-semibold text-text-secondary block mb-1">Enter Your Name</label>
              <input
                type="text"
                value={userProfile.fullName}
                onChange={(e) => updateProfile({ fullName: e.target.value })}
                className="px-4 py-2 border border-border-color rounded-xl text-center text-sm bg-bg-secondary focus:outline-none focus:border-primary max-w-xs w-full"
                placeholder="Abdullah / Aisha"
              />
            </div>
          </motion.div>
        )}

        {/* ==========================================================
            STEP 2: CHOOSE GOALS
            ========================================================== */}
        {onboardingStep === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-text-primary text-center">
              {t('onboarding.select_goals_title')}
            </h2>
            <p className="text-xs text-text-secondary mt-1 text-center mb-6">
              {t('onboarding.select_goals_subtitle')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {goalsOptions.map((goal) => {
                const isSelected = userProfile.goals.includes(goal.key);
                return (
                  <button
                    key={goal.key}
                    onClick={() => toggleGoalSelection(goal.key)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition text-left cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-bg-secondary/40 border-border-color text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{goal.emoji}</span>
                      <span>{goal.label}</span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ==========================================================
            STEP 3: CHOOSE LANGUAGE
            ========================================================== */}
        {onboardingStep === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col justify-center text-center"
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-text-primary">
              {t('onboarding.select_language_title')}
            </h2>
            <p className="text-xs text-text-secondary mt-1 mb-8">
              {t('onboarding.select_language_subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setLanguage('en')}
                className={`px-6 py-4 rounded-xl border text-sm font-bold w-40 transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-primary border-primary text-white shadow-lg'
                    : 'bg-bg-secondary border-border-color text-text-secondary hover:border-text-muted'
                }`}
              >
                🇺🇸 English
              </button>
              <button
                onClick={() => setLanguage('so')}
                className={`px-6 py-4 rounded-xl border text-sm font-bold w-40 transition cursor-pointer ${
                  language === 'so'
                    ? 'bg-primary border-primary text-white shadow-lg'
                    : 'bg-bg-secondary border-border-color text-text-secondary hover:border-text-muted'
                }`}
              >
                🇸🇴 Somali
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-6 py-4 rounded-xl border text-sm font-bold w-40 transition cursor-pointer ${
                  language === 'ar'
                    ? 'bg-primary border-primary text-white shadow-lg'
                    : 'bg-bg-secondary border-border-color text-text-secondary hover:border-text-muted'
                }`}
              >
                🇸🇦 العربية (RTL)
              </button>
            </div>
          </motion.div>
        )}

        {/* ==========================================================
            STEP 4: AI PERSONALIZATION SETUP
            ========================================================== */}
        {onboardingStep === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col justify-center"
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-text-primary text-center">
              {t('onboarding.ai_personalization_title')}
            </h2>
            <p className="text-xs text-text-secondary mt-1 text-center mb-6">
              {t('onboarding.ai_personalization_subtitle')}
            </p>

            <div className="space-y-4">
              {/* Learning Style select */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  {t('onboarding.learning_style')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['visual', 'reflective', 'action_oriented'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => updateProfile({ learningStyle: style })}
                      className={`py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                        userProfile.learningStyle === style
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-bg-secondary border-border-color text-text-secondary'
                      }`}
                    >
                      {style.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reminders select */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  {t('onboarding.reminder_pref')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['gentle', 'assertive', 'none'].map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => updateProfile({ reminderPref: pref })}
                      className={`py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                        userProfile.reminderPref === pref
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-bg-secondary border-border-color text-text-secondary'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Actions Footer */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border-color/60">
          {onboardingStep > 1 ? (
            <button
              onClick={handleBackStep}
              className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition cursor-pointer"
            >
              <ArrowLeft size={16} />
              {t('common.back')}
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNextStep}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow hover:scale-105 cursor-pointer"
          >
            {onboardingStep === 4 ? (
              <>
                <Sparkles size={14} />
                {t('onboarding.finish')}
              </>
            ) : (
              <>
                {t('common.next')}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
export default Onboarding;
