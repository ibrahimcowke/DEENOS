import React, { useState } from 'react';
import { Users, Trophy, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CommunityPage: React.FC = () => {
  const { t } = useTranslation();

  // Family Group mock data
  const familyMembers = [
    { name: 'Xasan Xarash (You)', role: 'Self', score: 85, level: 3, avatar: '👴' },
    { name: 'Aamina Maxamed', role: 'Mother', score: 95, level: 5, avatar: '🧕' },
    { name: 'Asha Xarash', role: 'Sister', score: 72, level: 2, avatar: '👧' },
    { name: 'Cali Xarash', role: 'Brother', score: 60, level: 1, avatar: '👦' }
  ];

  // Leaderboard mock data
  const leaderboard = [
    { rank: 1, name: 'Fatima Al-Sudais', xp: 5200, country: '🇸🇦', avatar: '🧕' },
    { rank: 2, name: 'Aamina Maxamed', xp: 4800, country: '🇸🇴', avatar: '🧕' },
    { rank: 3, name: 'Bilal Ibrahim', xp: 4500, country: '🇬🇧', avatar: '👨' },
    { rank: 4, name: 'Xasan Xarash', xp: 3800, country: '🇸🇴', avatar: '👴' },
    { rank: 5, name: 'Yousef Mansour', xp: 3100, country: '🇪🇬', avatar: '👦' }
  ];

  // Active Challenges mock data
  const [challenges, setChallenges] = useState([
    { id: 'c1', title: 'Recite Surah Al-Kahf on Friday', participants: 42, joined: true, progress: 80 },
    { id: 'c2', title: 'Establish all 5 prayers in Mosque (7d)', participants: 18, joined: false, progress: 45 },
    { id: 'c3', title: 'Feed 10 fasting people in Ramadan', participants: 65, joined: true, progress: 90 }
  ]);

  const handleToggleJoin = (id: string) => {
    setChallenges(challenges.map(c => {
      if (c.id === id) {
        const nextJoined = !c.joined;
        return {
          ...c,
          joined: nextJoined,
          participants: nextJoined ? c.participants + 1 : c.participants - 1
        };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Intro header */}
      <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Users className="text-primary" size={24} />
          {t('community.community_title')}
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">Connect with family members, compete on global leaderboards, and join collective spiritual challenges.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Family Groups */}
        <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
            <Users size={14} className="text-primary" />
            {t('community.family_groups')}
          </h3>

          <div className="space-y-3">
            {familyMembers.map((member, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-border-color bg-bg-secondary flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{member.avatar}</span>
                  <div>
                    <span className="text-xs font-extrabold text-text-primary block">{member.name}</span>
                    <span className="text-[10px] text-text-muted block mt-0.5">{member.role} • Lvl {member.level}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-primary block">{member.score}%</span>
                  <span className="text-[9px] text-text-muted block mt-0.5 font-bold uppercase">Deen Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Leaderboard */}
        <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
            <Trophy size={14} className="text-primary" />
            {t('community.leaderboard')}
          </h3>

          <div className="space-y-2">
            {leaderboard.map((user) => (
              <div 
                key={user.rank}
                className={`p-3 rounded-xl border flex justify-between items-center text-xs transition ${
                  user.rank === 4 // Self (Xasan)
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-bg-secondary border-border-color'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-text-muted w-4">{user.rank}</span>
                  <span className="text-lg">{user.avatar}</span>
                  <div>
                    <span className="font-bold block text-text-primary">{user.name} {user.country}</span>
                  </div>
                </div>
                <span className="font-extrabold text-primary">{user.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Challenges */}
        <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
            <Award size={14} className="text-primary" />
            {t('community.challenges')}
          </h3>

          <div className="space-y-3">
            {challenges.map((c) => (
              <div key={c.id} className="p-3.5 rounded-xl border border-border-color bg-bg-secondary flex flex-col gap-2.5 shadow-sm">
                <div>
                  <span className="text-xs font-bold text-text-primary block leading-snug">{c.title}</span>
                  <span className="text-[9px] text-text-muted block mt-1 font-semibold">{c.participants} Active Competitors</span>
                </div>

                <div className="w-full">
                  <div className="w-full h-1 bg-border-color rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>

                <button
                  onClick={() => handleToggleJoin(c.id)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center cursor-pointer transition ${
                    c.joined
                      ? 'bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20'
                      : 'bg-primary text-white hover:bg-primary-hover shadow-sm'
                  }`}
                >
                  {c.joined ? 'Joined' : 'Join Challenge'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CommunityPage;
