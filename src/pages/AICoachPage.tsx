import React from 'react';
import { AICoachChat } from '../components/AICoachChat';

export const AICoachPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40">
        <h2 className="text-xl font-bold tracking-tight text-text-primary">AI Muslim Coach</h2>
        <p className="text-xs text-text-secondary mt-0.5">Interact with your private Gemini coach. Switch modes to receive tailored advice on worship, habits, finances, or schedules.</p>
      </div>
      <AICoachChat />
    </div>
  );
};
export default AICoachPage;
