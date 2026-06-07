import { create } from 'zustand';
import { dbService, isSupabaseConfigured } from '../services/supabase';
import { useDeenStore } from './deenStore';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly';
  nextBillingDate: string;
  status: 'active' | 'paused' | 'cancelled';
}

export interface Expense {
  id: string;
  amount: number;
  category: 'food' | 'family' | 'education' | 'business' | 'charity' | 'entertainment' | 'bills' | 'custom';
  description: string;
  date: string;
}

export interface ZakatCalculation {
  goldVal: number;
  silverVal: number;
  cashVal: number;
  investmentVal: number;
  debtsVal: number;
  netAssets: number;
  zakatDue: number;
  isObligatory: boolean;
  calculatedAt: string;
}

interface FinanceState {
  subscriptions: Subscription[];
  expenses: Expense[];
  zakatHistory: ZakatCalculation[];
  
  // Actions
  syncFinanceData: () => Promise<void>;
  addSubscription: (name: string, price: number, cycle: Subscription['billingCycle'], nextBillingDate: string) => void;
  deleteSubscription: (id: string) => void;
  toggleSubscriptionStatus: (id: string) => void;
  addExpense: (amount: number, category: Expense['category'], description: string, date: string) => void;
  deleteExpense: (id: string) => void;
  calculateZakat: (gold: number, silver: number, cash: number, investments: number, debts: number) => ZakatCalculation;
  logZakatPayment: (calc: ZakatCalculation) => void;
  resetFinance: () => void;
}

const getStoredFinanceState = () => {
  try {
    const data = localStorage.getItem('deenos_finance_state');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return null;
};

// Start with empty arrays (actual data only)
const INITIAL_STATE = getStoredFinanceState() || {
  subscriptions: [],
  expenses: [],
  zakatHistory: []
};

export const useFinanceStore = create<FinanceState>((set, get) => {
  const saveState = (newState: Partial<FinanceState>) => {
    const currentState = { ...get(), ...newState };
    const { addSubscription, deleteSubscription, toggleSubscriptionStatus, addExpense, deleteExpense, calculateZakat, logZakatPayment, resetFinance, syncFinanceData, ...dataToSave } = currentState;
    localStorage.setItem('deenos_finance_state', JSON.stringify(dataToSave));
  };

  return {
    ...INITIAL_STATE,

    syncFinanceData: async () => {
      const uId = useDeenStore.getState().userId;
      if (!isSupabaseConfigured || uId === 'offline-servant-user') return;

      try {
        const subs = await dbService.getSubscriptions(uId);
        const exps = await dbService.getExpenses(uId);
        const zakat = await dbService.getZakatRecords(uId);

        const subsMapped: Subscription[] = subs.map((s: any) => ({
          id: s.id,
          name: s.name,
          price: parseFloat(s.price),
          currency: s.currency,
          billingCycle: s.billing_cycle,
          nextBillingDate: s.next_billing_date,
          status: s.status
        }));

        const expsMapped: Expense[] = exps.map((e: any) => ({
          id: e.id,
          amount: parseFloat(e.amount),
          category: e.category,
          description: e.description,
          date: e.expense_date
        }));

        const zakatMapped: ZakatCalculation[] = zakat.map((z: any) => ({
          goldVal: 0,
          silverVal: 0,
          cashVal: 0,
          investmentVal: 0,
          debtsVal: 0,
          netAssets: parseFloat(z.net_assets),
          zakatDue: parseFloat(z.zakat_due),
          isObligatory: parseFloat(z.zakat_due) > 0,
          calculatedAt: z.created_at
        }));

        const updatedState = {
          subscriptions: subsMapped,
          expenses: expsMapped,
          zakatHistory: zakatMapped
        };

        set(updatedState);
        saveState(updatedState);
      } catch (e) {
        console.error('Failed syncing finance data', e);
      }
    },

    addSubscription: async (name: string, price: number, cycle: Subscription['billingCycle'], nextBillingDate: string) => {
      const uId = useDeenStore.getState().userId;
      const newSub: Omit<Subscription, 'id'> = {
        name,
        price,
        currency: 'USD',
        billingCycle: cycle,
        nextBillingDate,
        status: 'active'
      };

      if (isSupabaseConfigured && uId !== 'offline-servant-user') {
        const response = await dbService.insertSubscription(uId, {
          name,
          price,
          currency: 'USD',
          billing_cycle: cycle,
          next_billing_date: nextBillingDate,
          status: 'active'
        });
        if (response.success && response.data) {
          const finalSub: Subscription = {
            id: response.data.id,
            ...newSub
          };
          const updated = [...get().subscriptions, finalSub];
          set({ subscriptions: updated });
          saveState({ subscriptions: updated });
        }
      } else {
        const finalSub: Subscription = {
          id: crypto.randomUUID(),
          ...newSub
        };
        const updated = [...get().subscriptions, finalSub];
        set({ subscriptions: updated });
        saveState({ subscriptions: updated });
      }
    },

    deleteSubscription: async (id: string) => {
      const updated = get().subscriptions.filter((s: Subscription) => s.id !== id);
      set({ subscriptions: updated });
      saveState({ subscriptions: updated });

      // Sync with Supabase DDL
      dbService.deleteSubscription(id);
    },

    toggleSubscriptionStatus: async (id: string) => {
      let nextStatus: Subscription['status'] = 'active';
      const updated = get().subscriptions.map((s: Subscription) => {
        if (s.id === id) {
          nextStatus = s.status === 'active' ? 'paused' : 'active';
          return { ...s, status: nextStatus };
        }
        return s;
      });
      set({ subscriptions: updated });
      saveState({ subscriptions: updated });

      // Sync with Supabase DDL
      dbService.updateSubscription(id, { status: nextStatus });
    },

    addExpense: async (amount: number, category: Expense['category'], description: string, date: string) => {
      const uId = useDeenStore.getState().userId;
      const newExp: Omit<Expense, 'id'> = {
        amount,
        category,
        description,
        date
      };

      if (isSupabaseConfigured && uId !== 'offline-servant-user') {
        const response = await dbService.insertExpense(uId, {
          amount,
          category,
          description,
          expense_date: date
        });
        if (response.success && response.data) {
          const finalExp: Expense = {
            id: response.data.id,
            ...newExp
          };
          const updated = [...get().expenses, finalExp];
          set({ expenses: updated });
          saveState({ expenses: updated });
        }
      } else {
        const finalExp: Expense = {
          id: crypto.randomUUID(),
          ...newExp
        };
        const updated = [...get().expenses, finalExp];
        set({ expenses: updated });
        saveState({ expenses: updated });
      }
    },

    deleteExpense: async (id: string) => {
      const updated = get().expenses.filter((e: Expense) => e.id !== id);
      set({ expenses: updated });
      saveState({ expenses: updated });

      // Sync with Supabase DDL
      dbService.deleteExpense(id);
    },

    calculateZakat: (gold: number, silver: number, cash: number, investments: number, debts: number) => {
      const netAssets = (gold + silver + cash + investments) - debts;
      const nisabThreshold = 6200.00;
      
      const isObligatory = netAssets >= nisabThreshold;
      const zakatDue = isObligatory ? Math.max(0, netAssets * 0.025) : 0;

      return {
        goldVal: gold,
        silverVal: silver,
        cashVal: cash,
        investmentVal: investments,
        debtsVal: debts,
        netAssets: parseFloat(netAssets.toFixed(2)),
        zakatDue: parseFloat(zakatDue.toFixed(2)),
        isObligatory,
        calculatedAt: new Date().toISOString()
      };
    },

    logZakatPayment: async (calc: ZakatCalculation) => {
      const uId = useDeenStore.getState().userId;
      const updated = [calc, ...get().zakatHistory];
      set({ zakatHistory: updated });
      saveState({ zakatHistory: updated });
      
      get().addExpense(calc.zakatDue, 'charity', 'Zakat Obligatory Annual Payment', calc.calculatedAt.split('T')[0]);

      // Sync with Supabase DDL
      dbService.insertZakatRecord(uId, {
        calculated_year: new Date().getFullYear(),
        net_assets: calc.netAssets,
        zakat_due: calc.zakatDue,
        status: 'paid',
        paid_at: new Date().toISOString()
      });
    },

    resetFinance: () => {
      set({
        subscriptions: [],
        expenses: [],
        zakatHistory: []
      });
      localStorage.removeItem('deenos_finance_state');
    }
  };
});
