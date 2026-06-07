import React, { useState } from 'react';
import { useUIStore } from '../store/uiStore';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { updateProfile } = useUIStore();
  const [activeMode, setActiveMode] = useState<'signin' | 'signup' | 'magic' | 'forgot'>('signin');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Trigger login completion
  const handleAuthSuccess = () => {
    // Write a mock authentication state directly to UI local storage
    localStorage.setItem('deenos_user_authenticated', 'true');
    // Force App reload or store state trigger
    window.dispatchEvent(new Event('deenos_auth_change'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    setTimeout(() => {
      setLoading(false);
      if (activeMode === 'signin') {
        if (email.trim() && password.length >= 6) {
          handleAuthSuccess();
        } else {
          setMessage({ text: 'Please enter a valid email and password (min 6 characters).', type: 'error' });
        }
      } else if (activeMode === 'signup') {
        if (email.trim() && password.length >= 6 && fullName.trim()) {
          updateProfile({ fullName });
          handleAuthSuccess();
        } else {
          setMessage({ text: 'Please fill out all fields correctly.', type: 'error' });
        }
      } else if (activeMode === 'magic') {
        if (email.trim()) {
          setMessage({ text: 'Magic Link sent successfully! Check your inbox for access.', type: 'success' });
        } else {
          setMessage({ text: 'Please enter a valid email address.', type: 'error' });
        }
      } else if (activeMode === 'forgot') {
        if (email.trim()) {
          setMessage({ text: 'Password reset link sent! Check your inbox.', type: 'success' });
        } else {
          setMessage({ text: 'Please enter a valid email address.', type: 'error' });
        }
      }
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      updateProfile({ fullName: 'Google User' });
      handleAuthSuccess();
    }, 1200);
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 relative overflow-hidden bg-bg-primary">
      {/* Visual background rings */}
      <div className="absolute top-[-30%] left-[-30%] w-[80%] h-[80%] rounded-full blur-3xl bg-primary/10" />
      <div className="absolute bottom-[-30%] right-[-30%] w-[80%] h-[80%] rounded-full blur-3xl bg-accent/15" />

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass border border-border-color rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col justify-between"
      >
        <div>
          {/* Logo brand */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-black text-xl shadow mb-3">
              D
            </div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight">DEENOS™</h1>
            <p className="text-xs text-text-secondary mt-1 font-medium">The Ultimate Muslim Life Operating System</p>
          </div>

          {/* Mode Switcher Tabs */}
          {activeMode !== 'forgot' && (
            <div className="flex border border-border-color rounded-xl p-1 bg-bg-tertiary/50 mb-6 gap-1">
              <button
                onClick={() => { setActiveMode('signin'); setMessage(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeMode === 'signin' ? 'bg-primary text-white shadow' : 'text-text-secondary'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveMode('signup'); setMessage(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeMode === 'signup' ? 'bg-primary text-white shadow' : 'text-text-secondary'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => { setActiveMode('magic'); setMessage(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeMode === 'magic' ? 'bg-primary text-white shadow' : 'text-text-secondary'
                }`}
              >
                Magic Link
              </button>
            </div>
          )}

          {/* Error / Success Notifications */}
          {message && (
            <div className={`p-3 rounded-xl border text-xs font-medium mb-4 flex items-start gap-2 ${
              message.type === 'success' 
                ? 'bg-success/10 border-success/20 text-success' 
                : 'bg-danger/10 border-danger/20 text-danger'
            }`}>
              {message.type === 'success' ? <ShieldCheck size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Authentication Input Forms */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeMode === 'signup' && (
              <div>
                <label className="text-[10px] font-bold text-text-secondary block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full border border-border-color bg-bg-primary/50 rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-text-secondary block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@deenos.com"
                  className="w-full border border-border-color bg-bg-primary/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            {(activeMode === 'signin' || activeMode === 'signup') && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-text-secondary block">Password</label>
                  {activeMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setActiveMode('forgot'); setMessage(null); }}
                      className="text-[9px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-border-color bg-bg-primary/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={14} />
                  {activeMode === 'signin' && 'Sign In'}
                  {activeMode === 'signup' && 'Create Account'}
                  {activeMode === 'magic' && 'Send Link'}
                  {activeMode === 'forgot' && 'Reset Password'}
                </>
              )}
            </button>
          </form>

          {/* Social Sign-In separators */}
          {(activeMode === 'signin' || activeMode === 'signup') && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="h-px bg-border-color flex-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Or Connect With</span>
                <div className="h-px bg-border-color flex-1" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2 border border-border-color hover:bg-bg-tertiary bg-bg-secondary rounded-xl text-xs font-bold text-text-secondary transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="text-sm">🌐</span>
                Continue with Google
              </button>
            </div>
          )}
        </div>

        {activeMode === 'forgot' && (
          <button
            onClick={() => { setActiveMode('signin'); setMessage(null); }}
            className="text-xs font-bold text-primary hover:underline self-center mt-6 cursor-pointer"
          >
            Back to Sign In
          </button>
        )}
      </motion.div>
    </div>
  );
};
export default Login;
