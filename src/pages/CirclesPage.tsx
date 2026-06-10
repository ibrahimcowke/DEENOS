import React, { useState } from 'react';
import { useCircleStore } from '../store/circleStore';
import { Users, Award, Plus, BookOpen, Trash2, Calendar, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CirclesPageProps {
  setActiveTab: (tab: string) => void;
}

export const CirclesPage: React.FC<CirclesPageProps> = () => {
  const { circles, createCircle, joinCircle, leaveCircle, sendHandshake, contributeToKhatm } = useCircleStore();
  const [selectedCircleId, setSelectedCircleId] = useState<string>(circles[0]?.id || '');
  
  // Form states
  const [newCircleName, setNewCircleName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const currentCircle = circles.find(c => c.id === selectedCircleId) || circles[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleName.trim()) return;
    createCircle(newCircleName);
    setNewCircleName('');
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#10b981', '#3b82f6']
    });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    joinCircle(joinCode);
    setJoinCode('');
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#fbbf24', '#10b981']
    });
  };

  const handleSendHandshake = (memberName: string) => {
    if (!currentCircle) return;
    sendHandshake(currentCircle.id, memberName);
    
    // Celebratory feedback
    confetti({
      particleCount: 40,
      spread: 40,
      colors: ['#fbbf24', '#f59e0b', '#10b981']
    });

    if (navigator.vibrate) {
      navigator.vibrate([40, 40]);
    }
  };

  const handleKhatmLog = () => {
    if (!currentCircle) return;
    // Each Juz contributed is roughly 3.3% of the Quran (30 Juz total)
    const progressDelta = 3.33;
    contributeToKhatm(currentCircle.id, progressDelta);
    
    confetti({
      particleCount: 80,
      spread: 70,
      colors: ['#3b82f6', '#10b981', '#fbbf24']
    });
  };

  const getDaysRemaining = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const diff = target - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  // Sort members by Deen Score descending for the leaderboard
  const sortedMembers = currentCircle 
    ? [...currentCircle.members].sort((a, b) => b.deenScore - a.deenScore)
    : [];

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-accent/5 to-bg-secondary p-6 rounded-3xl border border-primary/25 shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial-gradient from-primary/10 to-transparent blur-3xl rounded-full pointer-events-none" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">Community & Family Circles</h2>
            <p className="text-xs text-text-secondary mt-1">Share Consistency Streaks, track collaborative Quran Khatms, and support each other.</p>
          </div>
          
          {/* Active Circle Switcher dropdown */}
          {circles.length > 0 && (
            <div className="flex flex-col">
              <label className="text-[9px] uppercase font-black text-text-muted tracking-widest mb-1.5">Select Active Circle</label>
              <select
                value={selectedCircleId}
                onChange={(e) => setSelectedCircleId(e.target.value)}
                className="border border-border-color bg-bg-secondary text-xs font-bold rounded-xl px-3.5 py-2 text-text-primary focus:outline-none focus:border-primary cursor-pointer shadow-sm min-w-[180px]"
              >
                {circles.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {circles.length === 0 ? (
        <div className="glass-card border border-border-color rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 animate-bounce">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-black text-text-primary">No Spiritual Circles Joined</h3>
          <p className="text-xs text-text-muted mt-1.5 max-w-sm leading-relaxed">
            Spiritual circles let you build accountability with friends and family. Join a circle with a code or create your own.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full max-w-xl">
            {/* Create inline form */}
            <form onSubmit={handleCreate} className="p-5 rounded-2xl border border-border-color bg-bg-secondary/40 flex flex-col justify-between h-40">
              <div>
                <h4 className="text-xs font-black uppercase text-text-primary text-left">Create a Circle</h4>
                <input
                  type="text"
                  placeholder="e.g. Family Circle"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  className="w-full mt-3 border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer">
                Create Circle
              </button>
            </form>

            {/* Join inline form */}
            <form onSubmit={handleJoin} className="p-5 rounded-2xl border border-border-color bg-bg-secondary/40 flex flex-col justify-between h-40">
              <div>
                <h4 className="text-xs font-black uppercase text-text-primary text-left">Join a Circle</h4>
                <input
                  type="text"
                  placeholder="e.g. FA12-DEEN"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full mt-3 border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <button type="submit" className="w-full py-2 bg-accent hover:bg-accent/80 text-white text-xs font-bold rounded-xl transition cursor-pointer">
                Join Circle
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT COLUMN: ACTIVE CIRCLE DATA & MEMBERS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* A. Shared Quran Khatm Card */}
            {currentCircle && (
              <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/5 to-transparent blur-2xl rounded-full" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-color/40 pb-4 mb-5 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-text-primary">Shared Quran Khatm Progress</h3>
                      <p className="text-[10px] text-text-secondary mt-0.5">Collaborate to complete the Quran together</p>
                    </div>
                  </div>

                  <button
                    onClick={handleKhatmLog}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} /> Log 1 Juz Read (+30 XP)
                  </button>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-primary">Khatm Completion Progress</span>
                    <span className="font-extrabold text-primary text-sm">{Math.round(currentCircle.sharedKhatmProgress)}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-3 bg-bg-primary rounded-full overflow-hidden border border-border-color shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${currentCircle.sharedKhatmProgress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary via-emerald-450 to-primary shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-text-muted pt-1 border-t border-border-color/30">
                    <span className="font-semibold flex items-center gap-1">
                      <Calendar size={11} /> Target: {currentCircle.sharedKhatmTargetDate}
                    </span>
                    <span className="font-black uppercase tracking-wider text-accent animate-pulse-slow">
                      ⏱ {getDaysRemaining(currentCircle.sharedKhatmTargetDate)} Days Left
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* B. Circle Members Directory & Leaderboard */}
            {currentCircle && (
              <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <Award className="text-primary animate-pulse" size={20} />
                    <h3 className="text-base font-black text-text-primary">Circle Leaderboard</h3>
                  </div>
                  <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                    Invite Code: {currentCircle.code}
                  </span>
                </div>

                <div className="space-y-3">
                  {sortedMembers.map((member, idx) => {
                    const isUser = member.name === 'You';
                    
                    return (
                      <div 
                        key={member.name}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all duration-200 gap-4 ${
                          isUser 
                            ? 'border-primary/30 bg-primary/[0.03] shadow-inner' 
                            : 'border-border-color bg-bg-secondary/20 hover:bg-bg-secondary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Rank indicator */}
                          <span className={`text-xs font-black w-5 text-center shrink-0 ${
                            idx === 0 ? 'text-amber-500 text-sm' : idx === 1 ? 'text-text-secondary' : 'text-text-muted'
                          }`}>
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                          </span>

                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-2xl bg-bg-tertiary border border-border-color flex items-center justify-center text-xl shrink-0">
                            {member.avatar}
                          </div>

                          <div className="min-w-0">
                            <span className="text-sm font-bold text-text-primary block truncate">
                              {member.name} {isUser && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1.5">You</span>}
                            </span>
                            <span className="text-[10px] text-text-secondary block mt-0.5">
                              Level {member.level} • {member.deenScore} Deen Score
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-border-color/40 pt-3.5 sm:pt-0">
                          {/* Streak */}
                          <div className="flex items-center gap-1 shrink-0">
                            <Flame className="text-orange-500 fill-orange-500/10 animate-pulse-slow" size={16} />
                            <span className="text-xs font-black text-text-primary">{member.streak} Days</span>
                          </div>

                          {/* Handshakes */}
                          <div className="flex items-center gap-1.5 shrink-0 bg-bg-tertiary/40 border border-border-color/60 px-2.5 py-1 rounded-xl">
                            <span className="text-[10px] text-text-muted font-bold">🤝 {member.handshakesReceived}</span>
                          </div>

                          {/* Handshake trigger */}
                          {!isUser && (
                            <button
                              onClick={() => handleSendHandshake(member.name)}
                              className="px-3 py-1.5 bg-bg-primary hover:bg-primary hover:text-white border border-border-color hover:border-primary text-text-secondary text-[10px] font-bold rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              Send Handshake 🤝
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: CIRCLE ACTIONS */}
          <div className="space-y-6">
            
            {/* 1. Join a Circle */}
            <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40">
              <h3 className="text-sm font-black text-text-primary uppercase tracking-wider mb-1.5">Join New Circle</h3>
              <p className="text-[10px] text-text-secondary leading-relaxed mb-4">Enter a family invite code to join their spiritual consistency board.</p>

              <form onSubmit={handleJoin} className="space-y-3.5">
                <input
                  type="text"
                  placeholder="e.g. FA12-DEEN"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary uppercase tracking-widest font-black"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                >
                  Join Circle
                </button>
              </form>
            </div>

            {/* 2. Create a Circle */}
            <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40">
              <h3 className="text-sm font-black text-text-primary uppercase tracking-wider mb-1.5">Create a Circle</h3>
              <p className="text-[10px] text-text-secondary leading-relaxed mb-4">Create a new private workspace circle and invite your family and friends.</p>

              <form onSubmit={handleCreate} className="space-y-3.5">
                <input
                  type="text"
                  placeholder="e.g. Eid Friends Group"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary text-text-primary focus:outline-none focus:border-primary font-bold"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-accent hover:bg-accent/80 text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                >
                  Create Circle
                </button>
              </form>
            </div>

            {/* 3. Leave Circle Card */}
            {currentCircle && (
              <div className="glass-card border border-border-color/80 rounded-3xl p-6 bg-bg-secondary/40 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider mb-1.5">Circle Settings</h3>
                  <p className="text-[10px] text-text-secondary leading-relaxed mb-4">You are currently viewing <strong>{currentCircle.name}</strong>.</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to leave ${currentCircle.name}?`)) {
                      leaveCircle(currentCircle.id);
                    }
                  }}
                  className="w-full py-2 bg-danger/10 border border-danger/20 hover:bg-danger hover:text-white text-danger text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={13} /> Leave Circle
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CirclesPage;
