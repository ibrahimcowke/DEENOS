import React, { useState, useEffect } from 'react';
import { useDeenStore } from '../store/deenStore';
import { MoonStar, BarChart3, TrendingUp, Sparkles, Compass, MapPin, RotateCw, Navigation } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';

export const SalahTracker: React.FC = () => {
  const { t } = useTranslation();
  const { prayerLogs, logPrayer, nawafilLogs, logNawafil } = useDeenStore();

  const [activeSubTab, setActiveSubTab] = useState<'tracker' | 'qibla'>('tracker');
  
  // Geolocation States
  const [latitude, setLatitude] = useState<number>(21.4225); // Default to Makkah
  const [longitude, setLongitude] = useState<number>(39.8262);
  const [locName, setLocName] = useState<string>('Makkah (Default)');
  const [loadingLoc, setLoadingLoc] = useState<boolean>(false);
  const [orientationHeading, setOrientationHeading] = useState<number>(0);
  const [manualRotation, setManualRotation] = useState<number>(0);

  const nawafils = [
    { key: 'tahajjud', label: 'Tahajjud (Night Prayer)', time: 'Last 1/3 of Night' },
    { key: 'ishraq', label: 'Ishraq (Post-Sunrise)', time: '15 mins after Sunrise' },
    { key: 'duha', label: 'Duha (Forenoon Prayer)', time: 'Mid-morning' },
    { key: 'witr', label: 'Witr (Odd Prayer)', time: 'Post-Isha / Night' },
    { key: 'sunnah_rawatib', label: 'Sunnah Rawatib', time: "12 daily optional raka'ah" }
  ];

  // Dynamic calculation of prayer times
  const getCalculatedPrayerTimes = (lat: number, lon: number) => {
    // 4 minutes per degree longitude offset from GMT+3 base timezone
    const lonOffsetMinutes = (lon - 39.8262) * 4;
    // Latitude effect on length of day
    const latFactor = Math.abs(lat - 21.4225) * 0.05;

    const baseTimes = {
      fajr: 4.5,    // 04:30
      dhuhr: 12.33,  // 12:20
      asr: 15.66,   // 15:40
      maghrib: 18.75, // 18:45
      isha: 20.08    // 20:05
    };

    const formatTime = (hours: number) => {
      const totalMinutes = Math.round(hours * 60 + lonOffsetMinutes);
      let h = Math.floor(totalMinutes / 60) % 24;
      if (h < 0) h += 24;
      const m = Math.abs(totalMinutes % 60);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    return [
      { key: 'fajr', label: t('salah.fajr'), time: formatTime(baseTimes.fajr - latFactor) },
      { key: 'dhuhr', label: t('salah.dhuhr'), time: formatTime(baseTimes.dhuhr) },
      { key: 'asr', label: t('salah.asr'), time: formatTime(baseTimes.asr + latFactor * 0.4) },
      { key: 'maghrib', label: t('salah.maghrib'), time: formatTime(baseTimes.maghrib + latFactor) },
      { key: 'isha', label: t('salah.isha'), time: formatTime(baseTimes.isha + latFactor * 1.1) }
    ];
  };

  const prayers = getCalculatedPrayerTimes(latitude, longitude);
  const today = new Date().toISOString().split('T')[0];

  // Geolocation detector
  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(4)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(4)));
        setLocName('Detected Location');
        setLoadingLoc(false);
        confetti({ particleCount: 30, spread: 30 });
      },
      () => {
        setLoadingLoc(false);
        alert('Could not retrieve geolocation. Using default coordinates.');
      }
    );
  };

  // Device orientation API for compass
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        // alpha is heading in degrees
        setOrientationHeading(Math.round(e.alpha));
      }
    };
    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  // Kaaba direction calculation (offline mathematical formulation)
  const calculateQiblaDirection = (lat: number, lon: number) => {
    const qlat = 21.4225 * Math.PI / 180;
    const qlon = 39.8262 * Math.PI / 180;
    const ulat = lat * Math.PI / 180;
    const ulon = lon * Math.PI / 180;
    
    const dlon = qlon - ulon;
    const y = Math.sin(dlon);
    const x = Math.cos(ulat) * Math.tan(qlat) - Math.sin(ulat) * Math.cos(dlon);
    
    let qiblaRad = Math.atan2(y, x);
    let qiblaDeg = qiblaRad * 180 / Math.PI;
    if (qiblaDeg < 0) qiblaDeg += 360;
    return Math.round(qiblaDeg);
  };

  const qiblaAngle = calculateQiblaDirection(latitude, longitude);

  // Compass final rotation
  // heading is device orientation, manualRotation is slider manual simulation
  const currentHeading = orientationHeading || manualRotation;
  const compassRotation = 360 - currentHeading;
  const relativeQiblaAngle = (qiblaAngle + compassRotation) % 360;
  
  // Aligned means Qibla direction matches the top (0 degrees) +/- 5 degrees
  const isAligned = Math.abs(relativeQiblaAngle) <= 6 || Math.abs(relativeQiblaAngle - 360) <= 6;

  useEffect(() => {
    if (isAligned && activeSubTab === 'qibla') {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  }, [isAligned]);

  const getPrayerStatus = (prayerKey: string) => {
    const log = prayerLogs.find((l) => l.date === today && l.prayer_name === prayerKey);
    return log ? log.status : null;
  };

  const handleToggle = (prayerKey: string, option: string) => {
    const currentStatus = getPrayerStatus(prayerKey);
    const newStatus = currentStatus === option ? '' : option;
    logPrayer(prayerKey, newStatus, today);
  };

  const isNawafilLogged = (key: string) => {
    const logs = nawafilLogs || [];
    return logs.some((l) => l.prayer_name === key && l.date === today);
  };

  const handleNawafilLog = (key: string) => {
    logNawafil(key, today);
  };

  const getWeeklyAnalyticsData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
      
      const dayLogs = prayerLogs.filter(l => l.date === dateStr);
      const completedCount = dayLogs.filter(l => l.status && l.status !== 'missed' && l.status !== '').length;
      const rate = Math.round((completedCount / 5) * 100);
      
      data.push({
        day: dayLabel,
        rate: rate
      });
    }
    return data;
  };

  const getPrayerDistributionData = () => {
    let mosque = 0;
    let congregation = 0;
    let home = 0;
    let outside = 0;
    let delayed = 0;
    let missed = 0;

    prayerLogs.forEach(log => {
      if (log.status === 'jamaah_mosque') {
        mosque += 1;
        congregation += 1;
      } else if (log.status === 'individual_mosque') {
        mosque += 1;
      } else if (log.status === 'completed') {
        home += 1;
      } else if (log.status === 'individual_outside') {
        outside += 1;
      } else if (log.status === 'delayed') {
        delayed += 1;
      } else if (log.status === 'missed') {
        missed += 1;
      }
    });

    return [
      { name: 'Mosque', value: mosque },
      { name: 'Congregation', value: congregation },
      { name: 'Home', value: home },
      { name: 'Outside', value: outside },
      { name: 'Delayed', value: delayed },
      { name: 'Missed', value: missed }
    ];
  };

  const weeklyAnalyticsData = getWeeklyAnalyticsData();
  const prayerDistributionData = getPrayerDistributionData();

  return (
    <div className="space-y-6">
      {/* Subtab selection headers */}
      <div className="flex border-b border-border-color gap-4">
        <button
          onClick={() => setActiveSubTab('tracker')}
          className={`pb-3 text-sm font-extrabold capitalize transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'tracker'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Salah Tracker Dashboard
        </button>
        <button
          onClick={() => setActiveSubTab('qibla')}
          className={`pb-3 text-sm font-extrabold capitalize transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'qibla'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Compass size={14} />
          {t('enhancements.qibla_tracker')}
        </button>
      </div>

      {activeSubTab === 'tracker' ? (
        <>
          <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <MoonStar className="text-primary" size={24} />
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-text-primary">{t('salah.tracker_title')}</h2>
                  <p className="text-xs text-text-secondary mt-0.5">{t('salah.tracker_subtitle')}</p>
                </div>
              </div>
              
              <div className="bg-bg-tertiary/60 border border-border-color px-3.5 py-1 rounded-xl text-[10px] text-text-secondary flex items-center gap-1">
                <MapPin size={10} className="text-primary" />
                <span>{locName} ({latitude}, {longitude})</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Desktop-Only Layout */}
              <div className="hidden md:flex flex-col gap-4">
                {prayers.map((p) => {
                  const status = getPrayerStatus(p.key) || '';

                  return (
                    <div 
                      key={p.key} 
                      className="flex flex-row items-center justify-between p-4 rounded-xl border border-border-color bg-bg-secondary/80 gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
                          {p.label.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-extrabold text-text-primary block">{p.label}</span>
                          <span className="text-[10px] text-text-muted mt-0.5 block">{p.time}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'jamaah_mosque', label: "Jama'ah in Mosque (+25 XP)", activeClass: 'bg-emerald-600 border-emerald-700 text-white shadow font-black' },
                          { key: 'individual_mosque', label: 'Individual in Mosque (+15 XP)', activeClass: 'bg-teal-600 border-teal-700 text-white shadow font-black' },
                          { key: 'individual_outside', label: 'Individual Outside (+10 XP)', activeClass: 'bg-blue-600 border-blue-700 text-white shadow font-black' },
                          { key: 'delayed', label: 'Delayed (+5 XP)', activeClass: 'bg-amber-500 border-amber-600 text-white shadow font-black' },
                          { key: 'missed', label: 'Missed', activeClass: 'bg-red-500 border-red-600 text-white shadow font-black' }
                        ].map((opt) => {
                          const isActive = status === opt.key;
                          return (
                            <button
                              key={opt.key}
                              onClick={() => handleToggle(p.key, opt.key)}
                              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition duration-150 cursor-pointer ${
                                isActive
                                  ? opt.activeClass
                                  : 'bg-bg-tertiary border-border-color text-text-secondary hover:border-text-muted'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile-Only Layout */}
              <div className="flex flex-col gap-4 md:hidden">
                {prayers.map((p) => {
                  const status = getPrayerStatus(p.key) || '';
                  
                  const isPrayed = status === 'completed' || status === 'jamaah_mosque' || status === 'individual_mosque' || status === 'individual_outside';
                  const isDelayed = status === 'delayed';
                  const isMissed = status === 'missed';

                  const getStatusXp = (stat: string) => {
                    switch (stat) {
                      case 'jamaah_mosque': return 25;
                      case 'individual_mosque': return 15;
                      case 'individual_outside': return 10;
                      case 'completed': return 15;
                      case 'delayed': return 5;
                      default: return 0;
                    }
                  };
                  const currentXp = getStatusXp(status);

                  return (
                    <div 
                      key={p.key}
                      className={`p-4 rounded-2xl border transition-all duration-300 ${
                        isPrayed 
                          ? 'border-emerald-500/20 bg-emerald-500/5 shadow-sm shadow-emerald-500/5'
                          : isDelayed
                          ? 'border-amber-500/20 bg-amber-500/5 shadow-sm shadow-amber-500/5'
                          : isMissed 
                          ? 'border-red-500/20 bg-red-500/5 shadow-sm shadow-red-500/5'
                          : 'border-border-color bg-bg-secondary/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            isPrayed 
                              ? 'bg-emerald-500 shadow-md shadow-emerald-500/50' 
                              : isDelayed
                              ? 'bg-amber-500 shadow-md shadow-amber-500/50'
                              : isMissed 
                              ? 'bg-red-500 shadow-md shadow-red-500/50' 
                              : 'bg-text-muted/40'
                          }`} />
                          <div>
                            <span className="text-sm font-black text-text-primary block tracking-wide">{p.label}</span>
                            <span className="text-[10px] text-text-muted tracking-wide">{p.time}</span>
                          </div>
                        </div>
                        {currentXp > 0 && (
                          <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-black px-2.5 py-0.5 rounded-lg">
                            +{currentXp} XP
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          { key: 'jamaah_mosque', label: "🕌👥 Mosque Jama'ah", activeClass: 'bg-emerald-600 border-emerald-700 text-white shadow font-black', colSpan: false },
                          { key: 'individual_mosque', label: '🕌👤 Mosque Alone', activeClass: 'bg-teal-600 border-teal-700 text-white shadow font-black', colSpan: false },
                          { key: 'individual_outside', label: '🏠👤 Prayed Outside', activeClass: 'bg-blue-600 border-blue-700 text-white shadow font-black', colSpan: false },
                          { key: 'delayed', label: '⏳ Prayed Delayed', activeClass: 'bg-amber-500 border-amber-600 text-white shadow font-black', colSpan: false },
                          { key: 'missed', label: '❌ Missed Prayer', activeClass: 'bg-red-500 border-red-600 text-white shadow font-black', colSpan: true }
                        ].map((opt) => {
                          const isActive = status === opt.key;
                          return (
                            <button
                              key={opt.key}
                              onClick={() => handleToggle(p.key, opt.key)}
                              className={`py-2.5 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                                opt.colSpan ? 'col-span-2' : ''
                              } ${
                                isActive
                                  ? opt.activeClass
                                  : 'bg-bg-tertiary border-border-color text-text-secondary hover:border-text-muted hover:bg-bg-primary/50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Nawafil & Sunnah Section */}
          <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-500" size={24} />
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-text-primary">Nawafil & Sunnah Prayers</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Earn +5 XP for each optional sunnah or night prayer logged</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nawafils.map((n) => {
                const isLogged = isNawafilLogged(n.key);
                return (
                  <button
                    key={n.key}
                    onClick={() => handleNawafilLog(n.key)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition duration-200 cursor-pointer text-left w-full ${
                      isLogged
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-sm shadow-amber-500/5'
                        : 'bg-bg-secondary/80 border-border-color text-text-secondary hover:border-text-muted hover:bg-bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isLogged ? 'bg-amber-500/20 text-amber-500' : 'bg-bg-tertiary border border-border-color text-text-muted'
                      }`}>
                        {n.label.charAt(0)}
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${isLogged ? 'text-amber-500' : 'text-text-primary'}`}>
                          {n.label}
                        </span>
                        <span className="text-[9px] text-text-muted mt-0.5 block">{n.time}</span>
                      </div>
                    </div>
                    <div className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isLogged ? 'bg-amber-500 text-white' : 'bg-bg-tertiary text-text-muted border border-border-color'
                    }`}>
                      {isLogged ? 'Logged' : '+5 XP'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                {t('salah.weekly_trends')}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={weeklyAnalyticsData}>
                    <defs>
                      <linearGradient id="salahGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="rate" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#salahGlow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" />
                Prayer Location Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={prayerDistributionData}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: 11 }}
                    />
                    <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Qibla and Prayer Times Calculator view */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Geolocation coordinate inputs */}
          <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-5">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2 border-b border-border-color/60 pb-3">
              <MapPin size={18} className="text-primary" />
              Coordinate Auditor
            </h3>
            
            <div className="space-y-4">
              <button
                type="button"
                onClick={detectLocation}
                disabled={loadingLoc}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
              >
                <RotateCw size={14} className={loadingLoc ? 'animate-spin' : ''} />
                {loadingLoc ? 'Detecting...' : t('enhancements.detect_location')}
              </button>
              
              <div className="h-px bg-border-color/60" />
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => {
                      setLatitude(parseFloat(e.target.value) || 0);
                      setLocName('Manual Input');
                    }}
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => {
                      setLongitude(parseFloat(e.target.value) || 0);
                      setLocName('Manual Input');
                    }}
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary text-center font-bold"
                  />
                </div>
              </div>

              {/* Standard Cities presets */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block">City Presets</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { name: 'Makkah', lat: 21.4225, lon: 39.8262 },
                    { name: 'Medina', lat: 24.4672, lon: 39.6111 },
                    { name: 'Mogadishu', lat: 2.0439, lon: 45.3182 },
                    { name: 'London', lat: 51.5074, lon: -0.1278 },
                    { name: 'New York', lat: 40.7128, lon: -74.0060 },
                    { name: 'Cairo', lat: 30.0444, lon: 31.2357 }
                  ].map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setLatitude(c.lat);
                        setLongitude(c.lon);
                        setLocName(c.name);
                        confetti({ particleCount: 15, spread: 20 });
                      }}
                      className="px-2 py-1.5 rounded-lg border border-border-color bg-bg-primary/50 text-[10px] font-bold text-text-secondary hover:border-primary/40 hover:text-text-primary transition cursor-pointer text-center"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border-color/60 text-[10px] text-text-muted leading-relaxed">
              Kaaba is located at 21.4225° N, 39.8262° E. Calculations are executed in-browser using latitude and longitude trigonometric trigonometry.
            </div>
          </div>

          {/* Interactive Qibla Compass widget */}
          <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 flex flex-col items-center justify-center text-center space-y-6">
            <div>
              <h3 className="text-base font-bold text-text-primary flex items-center justify-center gap-1.5">
                <Compass size={18} className="text-primary" />
                Qibla Compass Direction
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">{t('enhancements.align_device')}</p>
            </div>

            {/* Glowing circular compass visualizer */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Outer glowing alignment indicators */}
              <div className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
                isAligned 
                  ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/10 scale-102 bg-emerald-500/5' 
                  : 'border-border-color/40 bg-bg-primary/10'
              }`} />
              
              {/* Target Kaaba marker glow */}
              <div 
                className="absolute w-8 h-8 flex items-center justify-center z-10 transition-transform duration-200"
                style={{
                  transform: `rotate(${relativeQiblaAngle}deg) translateY(-116px)`
                }}
              >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm shadow-md animate-bounce ${
                  isAligned 
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/50' 
                    : 'bg-primary border-primary-hover text-white'
                }`}>
                  🕋
                </div>
              </div>

              {/* Rotating Compass Disc */}
              <div 
                className="w-52 h-52 rounded-full border-2 border-border-color/80 bg-bg-secondary/80 flex items-center justify-center shadow-inner relative transition-transform duration-300"
                style={{ transform: `rotate(${compassRotation}deg)` }}
              >
                {/* Compass Directions */}
                <span className="absolute top-2.5 text-xs font-black text-danger">N</span>
                <span className="absolute right-3.5 text-xs font-black text-text-muted">E</span>
                <span className="absolute bottom-2.5 text-xs font-black text-text-muted">S</span>
                <span className="absolute left-3.5 text-xs font-black text-text-muted">W</span>

                {/* Rotating Needle indicator */}
                <div className="w-1.5 h-36 bg-gradient-to-b from-danger via-text-muted to-text-muted rounded-full relative flex justify-center">
                  <div className="absolute top-0 w-3 h-3 bg-danger rounded-full border-2 border-white/20" />
                </div>

                {/* Qibla Direction arc slice */}
                <div 
                  className="absolute w-full h-full border border-dashed border-primary/20 rounded-full"
                  style={{ transform: `rotate(${qiblaAngle}deg)` }}
                />
              </div>

              {/* Center point cap */}
              <div className="absolute w-4 h-4 bg-bg-primary border-2 border-border-color rounded-full z-10" />
            </div>

            {/* Alignment indicator text */}
            <div className="h-10 flex items-center justify-center">
              {isAligned ? (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm animate-pulse">
                  <Navigation size={12} className="rotate-45" />
                  {t('enhancements.aligned')}
                </div>
              ) : (
                <span className="text-xs font-bold text-text-secondary block">
                  Angle to Kaaba: <span className="text-primary font-black">{qiblaAngle}°</span> (Rotate {(relativeQiblaAngle > 180 ? 360 - relativeQiblaAngle : relativeQiblaAngle).toFixed(0)}° {relativeQiblaAngle > 180 ? 'Right' : 'Left'})
                </span>
              )}
            </div>

            {/* Manual device rotation simulation slider */}
            <div className="w-full px-4 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase">
                <span>Simulate Phone Rotation</span>
                <span>{currentHeading}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="359"
                value={manualRotation}
                onChange={(e) => setManualRotation(parseInt(e.target.value))}
                className="w-full accent-primary h-1.5 bg-border-color rounded-lg cursor-pointer"
              />
              <span className="text-[9px] text-text-muted block mt-1">On mobile, the compass rotates automatically using your device magnetometer.</span>
            </div>
          </div>

          {/* Dynamic computed prayer times list */}
          <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2 border-b border-border-color/60 pb-3">
              <MoonStar size={18} className="text-primary" />
              Calculated Geolocation timings
            </h3>

            <div className="space-y-2.5">
              {prayers.map((p) => (
                <div key={p.key} className="flex justify-between items-center p-3 rounded-xl border border-border-color bg-bg-primary/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary/30" />
                    <span className="text-xs font-bold text-text-primary capitalize">{p.label}</span>
                  </div>
                  <span className="text-xs font-black text-primary font-mono">{p.time}</span>
                </div>
              ))}
            </div>

            <div className="text-[9px] text-text-muted pt-2 block leading-relaxed">
              These prayer times are calculated directly on this device using coordinates. Small deviations can occur depending on elevation and standard calculation methods.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalahTracker;
