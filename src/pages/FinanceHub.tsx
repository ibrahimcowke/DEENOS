import React, { useEffect, useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import type { Subscription, Expense } from '../store/financeStore';
import { ZakatCalculator } from '../components/ZakatCalculator';
import { geminiService } from '../services/gemini';
import { Wallet, Sparkles, CreditCard, PlusCircle, Trash2, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const FinanceHub: React.FC = () => {
  const { 
    subscriptions, expenses, addSubscription, deleteSubscription, 
    toggleSubscriptionStatus, addExpense, deleteExpense 
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState<'subs' | 'expenses' | 'zakat'>('subs');

  // Form states for Subscriptions
  const [subName, setSubName] = useState('');
  const [subPrice, setSubPrice] = useState(0);
  const [subCycle, setSubCycle] = useState<Subscription['billingCycle']>('monthly');
  const [subDate, setSubDate] = useState('');
  const [showAddSub, setShowAddSub] = useState(false);

  // Form states for Expenses
  const [expAmount, setExpAmount] = useState(0);
  const [expCategory, setExpCategory] = useState<Expense['category']>('food');
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddExp, setShowAddExp] = useState(false);

  // AI subscription analysis states
  const [aiReport, setAiReport] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const totalMonthlySubCost = subscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, s) => {
      if (s.billingCycle === 'yearly') return acc + (s.price / 12);
      if (s.billingCycle === 'weekly') return acc + (s.price * 4);
      return acc + s.price;
    }, 0);

  const fetchAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const report = await geminiService.analyzeSubscriptions(subscriptions);
      setAiReport(report);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (subscriptions.length > 0) {
      fetchAiAnalysis();
    }
  }, [subscriptions]);

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || subPrice <= 0 || !subDate) return;
    addSubscription(subName, subPrice, subCycle, subDate);
    setSubName('');
    setSubPrice(0);
    setSubDate('');
    setShowAddSub(false);
  };

  const handleAddExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmount <= 0) return;
    addExpense(expAmount, expCategory, expDesc, expDate);
    setExpAmount(0);
    setExpDesc('');
    setShowAddExp(false);
  };

  // Recharts expense breakdown data
  const expenseBreakdown = expenses.reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const chartData = Object.keys(expenseBreakdown).map(cat => ({
    category: cat.toUpperCase(),
    amount: expenseBreakdown[cat]
  }));

  return (
    <div className="space-y-6">
      {/* Top Navigation Headers */}
      <div className="flex border-b border-border-color gap-4">
        {(['subs', 'expenses', 'zakat'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-extrabold capitalize transition-all border-b-2 cursor-pointer ${
              activeTab === tab 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab === 'subs' ? 'SaaS Subscriptions' : tab === 'expenses' ? 'Expense Tracking' : 'Zakat Calculator'}
          </button>
        ))}
      </div>

      {/* ========================================================
          1. SUBSCRIPTIONS MANAGER TAB
          ======================================================== */}
      {activeTab === 'subs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Subscriptions List Panel */}
          <div className="lg:col-span-2 glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <CreditCard className="text-primary" size={20} />
                  SaaS Subscriptions Manager
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">Track software renewals, duplicate payments, and active billing cycles</p>
              </div>
              <button
                onClick={() => setShowAddSub(!showAddSub)}
                className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle size={14} />
                Add Sub
              </button>
            </div>

            {showAddSub && (
              <form onSubmit={handleAddSub} className="p-4 rounded-xl border border-border-color bg-bg-primary/50 grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">Subscription Name</label>
                  <input
                    type="text"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="E.g. Quranly, ChatGPT Plus, Spotify"
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={subPrice || ''}
                    onChange={(e) => setSubPrice(parseFloat(e.target.value) || 0)}
                    placeholder="19.99"
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">Cycle</label>
                  <select
                    value={subCycle}
                    onChange={(e) => setSubCycle(e.target.value as Subscription['billingCycle'])}
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">Next Renewal Date</label>
                  <input
                    type="date"
                    value={subDate}
                    onChange={(e) => setSubDate(e.target.value)}
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
                    required
                  />
                </div>
                <div className="col-span-2 flex gap-2 pt-2">
                  <button type="submit" className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition">Save</button>
                  <button type="button" onClick={() => setShowAddSub(false)} className="px-4 py-2 border border-border-color rounded-xl text-xs font-bold text-text-secondary hover:bg-bg-tertiary">Cancel</button>
                </div>
              </form>
            )}

            {/* List */}
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="p-4 rounded-xl border border-border-color bg-bg-secondary flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
                      {sub.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-text-primary block">{sub.name}</span>
                      <span className="text-[10px] text-text-muted mt-0.5 block">Renewal: {sub.nextBillingDate} • Cycle: {sub.billingCycle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-text-primary block">${sub.price}</span>
                      <button
                        onClick={() => toggleSubscriptionStatus(sub.id)}
                        className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 block hover:underline cursor-pointer ${
                          sub.status === 'active' ? 'text-success' : 'text-text-muted'
                        }`}
                      >
                        {sub.status}
                      </button>
                    </div>
                    <button
                      onClick={() => deleteSubscription(sub.id)}
                      className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Subscription Analyzer Panel */}
          <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-accent" size={18} />
                <h3 className="text-base font-bold text-text-primary">AI Subscription Analyzer</h3>
              </div>

              <div className="text-xs leading-relaxed text-text-secondary space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {loadingAi ? (
                  <div className="flex flex-col items-center py-8">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] text-text-muted mt-2">Gemini is auditing budgets...</span>
                  </div>
                ) : (
                  aiReport.split('\n').map((line, idx) => {
                    if (line.startsWith('### ')) {
                      return <h4 key={idx} className="font-extrabold text-sm text-primary my-1">{line.substring(4)}</h4>;
                    }
                    if (line.startsWith('* ') || line.startsWith('- ')) {
                      return <li key={idx} className="ml-3 list-disc my-0.5">{line.substring(2)}</li>;
                    }
                    return <p key={idx}>{line}</p>;
                  })
                )}
              </div>
            </div>

            <div className="mt-4 border-t border-border-color/60 pt-4 flex justify-between items-center text-xs">
              <span className="text-text-secondary">Est. Monthly Cost:</span>
              <span className="font-black text-primary text-base">${totalMonthlySubCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. EXPENSE TRACKER TAB
          ======================================================== */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Expense Logger and List */}
          <div className="lg:col-span-2 glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Wallet className="text-primary" size={20} />
                  Expense Logging
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">Audit daily expenditures and filter by categories</p>
              </div>
              <button
                onClick={() => setShowAddExp(!showAddExp)}
                className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle size={14} />
                Log Expense
              </button>
            </div>

            {showAddExp && (
              <form onSubmit={handleAddExp} className="p-4 rounded-xl border border-border-color bg-bg-primary/50 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">Amount (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expAmount || ''}
                    onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as Expense['category'])}
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
                  >
                    <option value="food">Food</option>
                    <option value="family">Family</option>
                    <option value="education">Education</option>
                    <option value="business">Business</option>
                    <option value="charity">Charity</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="bills">Bills</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">Description</label>
                  <input
                    type="text"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="Bought coffee / Sadaqah donation"
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full border border-border-color rounded-xl px-3 py-2 text-xs bg-bg-primary focus:outline-none focus:border-primary text-text-primary"
                    required
                  />
                </div>
                <div className="col-span-2 flex gap-2 pt-2">
                  <button type="submit" className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition">Add</button>
                  <button type="button" onClick={() => setShowAddExp(false)} className="px-4 py-2 border border-border-color rounded-xl text-xs font-bold text-text-secondary hover:bg-bg-tertiary">Cancel</button>
                </div>
              </form>
            )}

            {/* List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {expenses.map((exp) => (
                <div key={exp.id} className="p-3 rounded-xl border border-border-color bg-bg-secondary flex justify-between items-center shadow-sm">
                  <div>
                    <span className="text-xs font-bold block text-text-primary">{exp.description || exp.category.toUpperCase()}</span>
                    <span className="text-[10px] text-text-muted mt-0.5 block">{exp.date} • <span className="capitalize">{exp.category}</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-text-primary">${exp.amount.toFixed(2)}</span>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense distribution Recharts Panel */}
          <div className="glass-card border border-border-color rounded-2xl p-6 bg-bg-secondary/40 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                <TrendingDown className="text-primary" size={16} />
                Expense Breakdown
              </h3>
              <div className="h-64">
                {chartData.length === 0 ? (
                  <p className="text-xs text-text-muted text-center pt-24">No expenses logged to display charts.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="category" stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: 10 }}
                      />
                      <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. ZAKAT CALCULATOR TAB
          ======================================================== */}
      {activeTab === 'zakat' && (
        <div className="flex justify-center py-2">
          <ZakatCalculator />
        </div>
      )}
    </div>
  );
};
export default FinanceHub;
