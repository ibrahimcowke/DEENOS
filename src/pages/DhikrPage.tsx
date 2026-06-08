import React, { useState } from 'react';
import { useDeenStore } from '../store/deenStore';
import { TasbihBeads } from '../components/TasbihBeads';
import { Compass, Sparkles, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const DhikrPage: React.FC = () => {
  const { t } = useTranslation();
  const { logDhikr, dhikrLogs } = useDeenStore();

  const [activeDhikr, setActiveDhikr] = useState<string>('subhanallah');
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [customDhikrText, setCustomDhikrText] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const dhikrOptions = [
    { key: 'subhanallah', label: t('dhikr.subhanallah'), arabic: 'سُبْحَانَ ٱللَّٰهِ', desc: 'Glory be to Allah' },
    { key: 'alhamdulillah', label: t('dhikr.alhamdulillah'), arabic: 'ٱلْحَمْدُ لِلَّٰهِ', desc: 'Praise be to Allah' },
    { key: 'allahuakbar', label: t('dhikr.allahuakbar'), arabic: 'ٱللَّٰهُ أَكْبَرُ', desc: 'Allah is the Greatest' },
    { key: 'astaghfirullah', label: t('dhikr.astaghfirullah'), arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ', desc: 'I seek forgiveness from Allah' },
    { key: 'custom', label: t('dhikr.custom_dhikr'), arabic: '', desc: 'Recite a custom supplication' }
  ];

  const handleIncrement = () => {
    setSessionCount((prev) => {
      const nextCount = prev + 1;
      
      // Auto-commit count to logs at key intervals or on complete
      if (nextCount % 33 === 0 || nextCount === target) {
        const today = new Date().toISOString().split('T')[0];
        const activeLabel = activeDhikr === 'custom' ? (customDhikrText || 'Custom Supplication') : activeDhikr;
        logDhikr(activeLabel, 33, today);
      }
      
      return nextCount;
    });
  };

  const handleReset = () => {
    // Save any remaining counts before resetting
    if (sessionCount > 0) {
      const today = new Date().toISOString().split('T')[0];
      const activeLabel = activeDhikr === 'custom' ? (customDhikrText || 'Custom Supplication') : activeDhikr;
      logDhikr(activeLabel, sessionCount % 33 || sessionCount, today);
    }
    setSessionCount(0);
  };

  const handleDhikrChange = (key: string) => {
    handleReset();
    setActiveDhikr(key);
  };

  const activeDhikrDetails = dhikrOptions.find((d) => d.key === activeDhikr);

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
        <div className="flex items-center gap-2 mb-4">
          <Compass className="text-primary" size={24} />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">{t('dhikr.tasbih_title')}</h2>
            <p className="text-xs text-text-secondary mt-0.5">{t('dhikr.tasbih_subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Main Tasbih Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Select Supplication */}
        <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Select Supplication</h3>
          
          {/* Mobile Select (Dropdown) */}
          <div className="relative md:hidden">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-3.5 rounded-xl border text-left flex justify-between items-center transition cursor-pointer bg-bg-secondary/50 border-border-color text-text-secondary hover:border-text-muted"
            >
              <div>
                <span className="text-xs font-bold block">
                  {activeDhikrDetails ? activeDhikrDetails.label : 'Select Supplication'}
                </span>
                <span className="text-[10px] text-text-muted mt-0.5 block">
                  {activeDhikrDetails ? activeDhikrDetails.desc : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {activeDhikrDetails?.arabic && (
                  <span className="text-sm font-semibold text-right text-text-primary pl-2">{activeDhikrDetails.arabic}</span>
                )}
                {isDropdownOpen ? <ChevronUp size={16} className="text-text-secondary animate-in fade-in duration-200" /> : <ChevronDown size={16} className="text-text-secondary animate-in fade-in duration-200" />}
              </div>
            </button>

            {isDropdownOpen && (
              <>
                {/* Backdrop overlay to close the dropdown when clicking outside */}
                <div 
                  className="fixed inset-0 z-20 cursor-default" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute z-30 left-0 right-0 mt-2 p-1.5 rounded-xl border border-border-color bg-bg-secondary/95 backdrop-blur-md shadow-xl flex flex-col gap-1 animate-in slide-in-from-top-2 duration-150">
                  {dhikrOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        handleDhikrChange(opt.key);
                        setIsDropdownOpen(false);
                      }}
                      className={`p-3 rounded-lg text-left flex justify-between items-center transition cursor-pointer ${
                        activeDhikr === opt.key
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'hover:bg-bg-primary/50 text-text-secondary'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block">{opt.label}</span>
                        <span className="text-[10px] text-text-muted mt-0.5 block">{opt.desc}</span>
                      </div>
                      {opt.arabic && (
                        <span className="text-xs font-semibold text-right text-text-primary pl-2">{opt.arabic}</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop Select (Vertical List) */}
          <div className="hidden md:flex flex-col gap-2">
            {dhikrOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleDhikrChange(opt.key)}
                className={`p-3.5 rounded-xl border text-left flex justify-between items-center transition cursor-pointer ${
                  activeDhikr === opt.key
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-bg-secondary/50 border-border-color text-text-secondary hover:border-text-muted'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[10px] text-text-muted mt-0.5 block">{opt.desc}</span>
                </div>
                {opt.arabic && (
                  <span className="text-sm font-semibold text-right text-text-primary pl-4">{opt.arabic}</span>
                )}
              </button>
            ))}
          </div>

          {activeDhikr === 'custom' && (
            <div className="pt-2">
              <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Custom Supplication Text</label>
              <input
                type="text"
                value={customDhikrText}
                onChange={(e) => setCustomDhikrText(e.target.value)}
                placeholder="La ilaha illallah..."
                className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary"
              />
            </div>
          )}
        </div>

        {/* Middle Column: Interactive Bead Counter */}
        <div className="flex flex-col justify-center">
          <TasbihBeads
            count={sessionCount}
            target={target}
            onIncrement={handleIncrement}
            onReset={handleReset}
          />
        </div>

        {/* Right Column: Parameters & Session Logs */}
        <div className="flex flex-col gap-6">
          {/* Target Parameters & Virtues */}
          <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-accent" size={16} />
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Dhikr Target Parameters</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[33, 99, 100].map((tVal) => (
                  <button
                    key={tVal}
                    onClick={() => setTarget(tVal)}
                    className={`py-2 rounded-lg border text-xs font-bold cursor-pointer transition duration-150 ${
                      target === tVal
                        ? 'bg-primary/10 border-primary text-primary shadow-sm'
                        : 'bg-bg-secondary border-border-color text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    {tVal}
                  </button>
                ))}
              </div>

              {activeDhikrDetails && (
                <div className="mt-4 p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-2.5">
                  <span className="text-xs font-bold text-primary block flex items-center gap-1.5">
                    <Heart size={12} className="fill-primary/20" />
                    Virtue of Recitation
                  </span>
                  <p className="text-[11px] leading-relaxed text-text-secondary">
                    {activeDhikr === 'subhanallah' && 'Log 33 counts of Subhan Allah after prayer to wipe away sins like the foam of the sea.'}
                    {activeDhikr === 'alhamdulillah' && 'Expressing Alhamdulillah fills the spiritual balance scale (Mizan) with heavy rewards.'}
                    {activeDhikr === 'allahuakbar' && 'Asserting Allahs greatness resets the ego and locks focus into the absolute Creator.'}
                    {activeDhikr === 'astaghfirullah' && 'Seeking forgiveness continuously opens doors of sustenance, strength, and ease.'}
                    {activeDhikr === 'custom' && 'Making continuous Du’a and supplications creates direct communication lines with Allah.'}
                  </p>
                </div>
              )}
            </div>

            <div className="text-[10px] text-text-muted pt-4 border-t border-border-color/60">
              * Note: Complete your active target to unlock the "Dhikr Master" level reward badge.
            </div>
          </div>

          {/* Tasbih Session Logs */}
          <div className="glass-card border border-border-color rounded-2xl p-5 bg-bg-secondary/40 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
              <Compass size={12} className="text-primary" />
              Tasbih Session Logs
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {dhikrLogs.length === 0 ? (
                <p className="text-[11px] text-text-muted text-center py-6">No tasbih sessions logged today yet.</p>
              ) : (
                [...dhikrLogs].reverse().slice(0, 5).map((log, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl border border-border-color bg-bg-primary/40 text-[10px] hover:border-primary/20 transition">
                    <div>
                      <span className="font-extrabold text-text-primary block capitalize">{log.name}</span>
                      <span className="text-text-muted">{log.date}</span>
                    </div>
                    <div className="bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-lg font-black text-xs">
                      +{log.count}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DhikrPage;
