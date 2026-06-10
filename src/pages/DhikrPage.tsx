import React, { useState } from 'react';
import { useDeenStore } from '../store/deenStore';
import { useUIStore } from '../store/uiStore';
import { TasbihBeads } from '../components/TasbihBeads';
import { Compass, Sparkles, Heart, ChevronDown, ChevronUp, Check, BookOpen, Clock, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';

interface Supplication {
  id: string;
  category: 'morning_evening' | 'anxiety' | 'gratitude' | 'travel';
  title: string;
  arabic: string;
  transliteration: string;
  translationEn: string;
  translationAr: string;
  translationSo: string;
  target: number;
}

export const DhikrPage: React.FC = () => {
  const { t } = useTranslation();
  const { logDhikr, dhikrLogs } = useDeenStore();
  const { language } = useUIStore();

  const [activeSubTab, setActiveSubTab] = useState<'counter' | 'library'>('counter');
  
  // Tasbih Counter States
  const [activeDhikr, setActiveDhikr] = useState<string>('subhanallah');
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [customDhikrText, setCustomDhikrText] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Library States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [duaCounts, setDuaCounts] = useState<Record<string, number>>({});

  const dhikrOptions = [
    { key: 'subhanallah', label: t('dhikr.subhanallah'), arabic: 'سُبْحَانَ ٱللَّٰهِ', desc: 'Glory be to Allah' },
    { key: 'alhamdulillah', label: t('dhikr.alhamdulillah'), arabic: 'ٱلْحَمْدُ لِلَّٰهِ', desc: 'Praise be to Allah' },
    { key: 'allahuakbar', label: t('dhikr.allahuakbar'), arabic: 'ٱللَّٰهُ أَكْبَرُ', desc: 'Allah is the Greatest' },
    { key: 'astaghfirullah', label: t('dhikr.astaghfirullah'), arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ', desc: 'I seek forgiveness from Allah' },
    { key: 'custom', label: t('dhikr.custom_dhikr'), arabic: '', desc: 'Recite a custom supplication' }
  ];

  const supplications: Supplication[] = [
    {
      id: 'dua_morning_1',
      category: 'morning_evening',
      title: 'Morning/Evening Shield (Protection)',
      arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
      transliteration: "Bismillahilladhi la yadurru ma'as-mihi shai'un fil-ardi wa la fis-sama'i, wa Huwas-Sami'ul-'Alim",
      translationEn: "In the Name of Allah with Whose Name nothing can cause harm in the earth nor in the heaven, and He is the All-Hearing, the All-Knowing.",
      translationAr: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم",
      translationSo: "Ku bilaabay magaca Ilaahay kan aan magaciisa waxba ku dhibayn dhulka iyo samada dhexdeeda, waana Maqla awooda badan, Wax walba ogaada.",
      target: 3
    },
    {
      id: 'dua_morning_2',
      category: 'morning_evening',
      title: 'Sayyid al-Istighfar (Chief Forgiveness)',
      arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
      transliteration: "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu. A'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u bidhanbi faghfir li, fa-innahu la yaghfiru-dhunuba illa anta",
      translationEn: "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I remain faithful to Your covenant and promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for indeed, none forgives sins but You.",
      translationAr: "اللهم أنت ربي لا إله إلا أنت خلقتني وأنا عبدك وأنا على عهدك ووعدك ما استطعت أعوذ بك من شر ما صنعت أبوء لك بنعمتك علي وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت",
      translationSo: "Alloow adigu waxaad tahay Eebbehay, Ilaah kale ma jiro adiga mooyee. Adiga ayaa i abuuray aniguna waxaan ahay adeegeeda, waxaana ku taaganahay ballankaaga iyo yaboohaaga intaan awoodo. Waxaan kaa magan-galayaa sharka waxaan sameeyey. Waxaan kuu qiranayaa nicmadaada korkayga ah, waxaana qiranayaa dembigayga, markaa ii dambi dhaaf, waayo qofna ma dambi dhaafo adiga mooyee.",
      target: 1
    },
    {
      id: 'dua_anxiety_1',
      category: 'anxiety',
      title: 'Dua for Distress & Anxiety Relief',
      arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
      transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazani, wal-'ajzi wal-kasali, wal-bukhli wal-jubni, wa dala'id-dayni wa ghalabatir-rijal",
      translationEn: "O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.",
      translationAr: "اللهم إني أعوذ بك من الهم والحزن، والعجز والكسل، والبخل والجبن، وضلع الدين وغلبة الرجال",
      translationSo: "Alloow waxaan kaa magan-gelayaa welwelka iyo murugada, tabar-darrada iyo caajisnimada, bakhaylnimada iyo fuleynimada, culayska deynta iyo in raggu iga adkaado.",
      target: 1
    },
    {
      id: 'dua_gratitude_1',
      category: 'gratitude',
      title: 'Dua for Shukr (Gratitude)',
      arabic: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ',
      transliteration: "Rabbi awzi'ni an ashkura ni'matakal-lati an'amta 'alayya wa 'ala walidayya wa an a'mala salihan tardahu",
      translationEn: "My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents and to do righteousness of which You approve.",
      translationAr: "رب أوزعني أن أشكر نعمتك التي أنعمت علي وعلى والدي وأن أعمل صالحا ترضاه",
      translationSo: "Eebbow ii yeel inaan ku shukriyo nicmadaada aad ii Nicmeysay aniga iyo waalidkayba, iyo inaan sameeyo camal suuban oo aad raalli ka tahay.",
      target: 1
    },
    {
      id: 'dua_travel_1',
      category: 'travel',
      title: 'Travel Supplication',
      arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ',
      transliteration: "Subhanalladhi sakhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina lamunqalibun",
      translationEn: "Glory to Him Who has subjected this to us, and we could never have it by our efforts. And verily, to our Lord we indeed are to return.",
      translationAr: "سبحان الذي سخر لنا هذا وما كنا له مقرنين وإنا إلى ربنا لمنقلبون",
      translationSo: "Waxaa nasahan kan noo sakhiray kan, mana ahayn kuwo awooda, runtiina xagga Eebbeheena ayaan u soo noqonaynaa.",
      target: 1
    }
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

  // Dua recitation counter
  const handleReciteDua = (dua: Supplication) => {
    const currentCount = duaCounts[dua.id] || 0;
    if (currentCount >= dua.target) return;

    const nextCount = currentCount + 1;
    const updatedCounts = { ...duaCounts, [dua.id]: nextCount };
    setDuaCounts(updatedCounts);

    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    if (nextCount === dua.target) {
      const today = new Date().toISOString().split('T')[0];
      logDhikr(`Dua: ${dua.title}`, dua.target, today);
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#10b981', '#fbbf24', '#3b82f6']
      });
    }
  };

  const resetDuaCounts = () => {
    setDuaCounts({});
  };

  const activeDhikrDetails = dhikrOptions.find((d) => d.key === activeDhikr);

  const filteredDuas = selectedCategory === 'all' 
    ? supplications 
    : supplications.filter(d => d.category === selectedCategory);

  const getDuaTranslation = (dua: Supplication) => {
    if (language === 'ar') return dua.translationAr;
    if (language === 'so') return dua.translationSo;
    return dua.translationEn;
  };

  return (
    <div className="space-y-6">
      {/* Tab switch buttons */}
      <div className="flex border-b border-border-color gap-4">
        <button
          onClick={() => setActiveSubTab('counter')}
          className={`pb-3 text-sm font-extrabold capitalize transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'counter'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Tasbih Bead Counter
        </button>
        <button
          onClick={() => setActiveSubTab('library')}
          className={`pb-3 text-sm font-extrabold capitalize transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'library'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <BookOpen size={14} />
          {t('enhancements.dua_library')}
        </button>
      </div>

      {activeSubTab === 'counter' ? (
        <>
          {/* Tasbih Counter View */}
          <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="text-primary" size={24} />
              <div>
                <h2 className="text-xl font-bold tracking-tight text-text-primary">{t('dhikr.tasbih_title')}</h2>
                <p className="text-xs text-text-secondary mt-0.5">{t('dhikr.tasbih_subtitle')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Select Supplication</h3>
              
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
                    {isDropdownOpen ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
                  </div>
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute z-30 left-0 right-0 mt-2 p-1.5 rounded-xl border border-border-color bg-bg-secondary/95 backdrop-blur-md shadow-xl flex flex-col gap-1">
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

            <div className="flex flex-col justify-center animate-in zoom-in duration-200">
              <TasbihBeads
                count={sessionCount}
                target={target}
                onIncrement={handleIncrement}
                onReset={handleReset}
              />
            </div>

            <div className="flex flex-col gap-6">
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
        </>
      ) : (
        /* Supplications Library View */
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 border-b border-border-color/60 pb-4">
            {[
              { id: 'all', label: 'All Duas', icon: BookOpen },
              { id: 'morning_evening', label: 'Morning & Evening', icon: Clock },
              { id: 'anxiety', label: 'Anxiety & Relief', icon: Heart },
              { id: 'gratitude', label: 'Gratitude', icon: Sparkles },
              { id: 'travel', label: 'Travel', icon: Shield }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-primary border-primary text-white shadow-md'
                    : 'bg-bg-secondary/60 border-border-color text-text-secondary hover:border-text-muted hover:bg-bg-secondary'
                }`}
              >
                <cat.icon size={13} />
                {cat.label}
              </button>
            ))}

            <button
              onClick={resetDuaCounts}
              className="ml-auto px-3.5 py-2 border border-border-color text-text-muted hover:text-text-primary rounded-xl text-xs font-bold transition hover:bg-bg-tertiary cursor-pointer"
            >
              Reset Session Counts
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDuas.map(dua => {
              const currentCount = duaCounts[dua.id] || 0;
              const isCompleted = currentCount >= dua.target;

              return (
                <div
                  key={dua.id}
                  className={`glass-card border rounded-3xl p-6 bg-bg-secondary/40 flex flex-col justify-between space-y-5 transition duration-300 ${
                    isCompleted 
                      ? 'border-emerald-500/25 bg-emerald-500/5 shadow-md shadow-emerald-500/5' 
                      : 'border-border-color hover:border-primary/25 hover:shadow-lg'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {dua.category.replace('_', ' ')}
                      </span>
                      {isCompleted && (
                        <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <Check size={10} /> Completed
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-extrabold text-text-primary">{dua.title}</h4>

                    {/* Arabic verse */}
                    <p className="text-xl text-right font-semibold text-text-primary leading-loose tracking-wide font-arabic py-2 select-text border-y border-border-color/40 my-3">
                      {dua.arabic}
                    </p>

                    {/* Transliteration */}
                    <div className="text-[11px] italic text-text-secondary leading-relaxed pl-2.5 border-l-2 border-primary/40 select-text">
                      {dua.transliteration}
                    </div>

                    {/* Translation */}
                    <p className="text-xs text-text-muted leading-relaxed select-text pt-2">
                      {getDuaTranslation(dua)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border-color/60 flex justify-between items-center">
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] uppercase font-black text-text-muted tracking-wider">Read Progress</span>
                      <span className="text-xs font-black text-text-primary mt-0.5">
                        {currentCount} <span className="text-text-muted font-normal">/ {dua.target} repetitions</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleReciteDua(dua)}
                      disabled={isCompleted}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shadow cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                          : 'bg-primary hover:bg-primary-hover text-white'
                      }`}
                    >
                      {isCompleted ? 'Completed' : `Recite (${currentCount}/${dua.target})`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default DhikrPage;
