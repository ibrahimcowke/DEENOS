import React, { useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import type { ZakatCalculation } from '../store/financeStore';
import { Calculator, DollarSign, ShieldCheck, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ZakatCalculator: React.FC = () => {
  const { calculateZakat, logZakatPayment, zakatHistory } = useFinanceStore();

  const [gold, setGold] = useState<number>(0);
  const [silver, setSilver] = useState<number>(0);
  const [cash, setCash] = useState<number>(0);
  const [investments, setInvestments] = useState<number>(0);
  const [debts, setDebts] = useState<number>(0);

  const [activeCalculation, setActiveCalculation] = useState<ZakatCalculation | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = calculateZakat(gold, silver, cash, investments, debts);
    setActiveCalculation(result);
    setPaymentSuccess(false);
  };

  const handlePayZakat = () => {
    if (!activeCalculation) return;
    setPaymentLoading(true);

    // Simulate Stripe payment gateway transaction
    setTimeout(() => {
      setPaymentLoading(false);
      setPaymentSuccess(true);
      logZakatPayment(activeCalculation);
      
      // Fire confetti for charity milestone!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#fbbf24', '#ffffff']
      });
    }, 2000);
  };

  return (
    <div className="p-6 glass-card border border-border-color rounded-2xl w-full max-w-xl mx-auto shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="text-primary" size={24} />
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Zakat Calculator</h2>
          <p className="text-xs text-text-secondary mt-0.5">Determine your annual spiritual charity obligation (2.5% of net wealth above Nisab)</p>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1">Gold Value (USD)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input
              type="number"
              value={gold || ''}
              onChange={(e) => setGold(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0.00"
              className="pl-8 pr-3 py-2 w-full border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1">Silver Value (USD)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input
              type="number"
              value={silver || ''}
              onChange={(e) => setSilver(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0.00"
              className="pl-8 pr-3 py-2 w-full border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1">Cash (Bank & Hand)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input
              type="number"
              value={cash || ''}
              onChange={(e) => setCash(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0.00"
              className="pl-8 pr-3 py-2 w-full border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1">Stocks & Investments</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input
              type="number"
              value={investments || ''}
              onChange={(e) => setInvestments(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0.00"
              className="pl-8 pr-3 py-2 w-full border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-text-secondary block mb-1">Deductible Liabilities & Debts</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input
              type="number"
              value={debts || ''}
              onChange={(e) => setDebts(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0.00"
              className="pl-8 pr-3 py-2 w-full border border-border-color rounded-xl bg-bg-primary/50 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          className="sm:col-span-2 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition hover:scale-[1.01] shadow-md mt-2"
        >
          Calculate Net Zakat
        </button>
      </form>

      {/* Calculation Output panel */}
      {activeCalculation && (
        <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-text-secondary">Net Zakatable Assets:</span>
            <span className="font-bold text-right text-text-primary">${activeCalculation.netAssets.toLocaleString()}</span>
            
            <span className="text-text-secondary">Nisab Threshold Reference:</span>
            <span className="font-semibold text-right text-text-primary">$6,200.00</span>
            
            <span className="text-text-secondary">Status:</span>
            <span className={`font-extrabold text-right uppercase ${activeCalculation.isObligatory ? 'text-warning' : 'text-text-muted'}`}>
              {activeCalculation.isObligatory ? 'Above Nisab' : 'Below Nisab'}
            </span>
          </div>

          <div className="border-t border-border-color pt-3 flex justify-between items-center">
            <div>
              <span className="text-xs text-text-secondary block">Total Zakat Due (2.5%)</span>
              <span className="text-2xl font-black text-primary">${activeCalculation.zakatDue.toLocaleString()}</span>
            </div>

            {activeCalculation.isObligatory && activeCalculation.zakatDue > 0 && !paymentSuccess && (
              <button
                onClick={handlePayZakat}
                disabled={paymentLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition duration-300 hover:scale-105 shadow"
              >
                <DollarSign size={14} />
                {paymentLoading ? 'Connecting Stripe...' : 'Pay Zakat via Stripe'}
              </button>
            )}

            {paymentSuccess && (
              <div className="flex items-center gap-1.5 text-success font-semibold text-xs border border-success/20 bg-success/10 px-3 py-1.5 rounded-xl">
                <ShieldCheck size={14} />
                Zakat Paid Successfully
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Log */}
      {zakatHistory.length > 0 && (
        <div className="mt-6 border-t border-border-color pt-4">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Zakat History Logs</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
            {zakatHistory.map((history, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 rounded bg-bg-tertiary text-xs">
                <div>
                  <span className="font-semibold block text-text-primary">Zakat Paid: ${history.zakatDue}</span>
                  <span className="text-[10px] text-text-muted">{new Date(history.calculatedAt).toLocaleDateString()}</span>
                </div>
                <span className="text-[10px] text-success font-bold flex items-center gap-1">
                  <HeartHandshake size={10} /> Paid
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default ZakatCalculator;
