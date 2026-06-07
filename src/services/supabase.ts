import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xtggumewntholgnbdtel.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0Z2d1bWV3bnRob2xnbmJkdGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MzE2NjUsImV4cCI6MjA5NjQwNzY2NX0.hIt2MItCMVpM7jUvtY4nNV4E19LCXfDs3cZ0B9HliWk';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'DEENOS™: Supabase URL and Anon Key are missing. Running in high-fidelity offline LocalStorage mode.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Dynamic check to determine if Database operations are active
export const isOnline = () => typeof window !== 'undefined' && navigator.onLine;
const isDbActive = () => isSupabaseConfigured && supabase && isOnline();

// Complete DB Sync Service
export const dbService = {
  // --- Profiles ---
  async getProfile(userId: string) {
    if (isDbActive()) {
      const { data, error } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error) return data;
    }
    const localProfile = localStorage.getItem('deenos_ui_state');
    if (localProfile) {
      const parsed = JSON.parse(localProfile);
      return {
        id: userId,
        email: 'user@deenos.com',
        full_name: parsed.userProfile?.fullName || 'Servant of Allah',
        goals_selected: parsed.userProfile?.goals || [],
        learning_style: parsed.userProfile?.learningStyle || 'visual',
        reminder_preferences: parsed.userProfile?.reminderPref || 'push',
        current_level: 1,
        current_xp: 0,
        deen_score: 0
      };
    }
    return { id: userId, email: 'user@deenos.com', full_name: 'Servant of Allah', goals_selected: [] };
  },

  async syncProfile(userId: string, profileData: any) {
    if (isDbActive()) {
      const { error } = await supabase!
        .from('profiles')
        .upsert({ id: userId, ...profileData });
      return { success: !error, error };
    }
    return { success: true, error: null };
  },

  // --- Salah Logs ---
  async getPrayerLogs(userId: string) {
    if (isDbActive()) {
      const { data, error } = await supabase!
        .from('prayer_logs')
        .select('*')
        .eq('user_id', userId);
      if (!error) return data;
    }
    return [];
  },

  async logPrayer(userId: string, prayerName: string, status: string, date: string) {
    if (isDbActive()) {
      const { error } = await supabase!
        .from('prayer_logs')
        .upsert({ user_id: userId, prayer_name: prayerName, status, prayer_date: date });
      return { success: !error, error };
    }
    return { success: true, error: null };
  },

  // --- Quran Progress ---
  async getQuranProgress(userId: string) {
    if (isDbActive()) {
      const { data, error } = await supabase!
        .from('quran_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_read_at', { ascending: false });
      if (!error) return data;
    }
    return [];
  },

  async syncQuranProgress(userId: string, progress: any) {
    if (isDbActive()) {
      const { error } = await supabase!
        .from('quran_progress')
        .upsert({ user_id: userId, ...progress });
      return { success: !error, error };
    }
    return { success: true, error: null };
  },

  // --- Dhikr Logs ---
  async getDhikrLogs(userId: string) {
    if (isDbActive()) {
      const { data, error } = await supabase!
        .from('dhikr_logs')
        .select('*')
        .eq('user_id', userId);
      if (!error) return data;
    }
    return [];
  },

  async insertDhikrLog(userId: string, log: any) {
    if (isDbActive()) {
      const { error } = await supabase!
        .from('dhikr_logs')
        .insert({ user_id: userId, ...log });
      return { success: !error, error };
    }
    return { success: true, error: null };
  },

  // --- Habits ---
  async getHabits(userId: string) {
    if (isDbActive()) {
      const { data, error } = await supabase!
        .from('habits')
        .select('*')
        .eq('user_id', userId);
      if (!error) return data;
    }
    return [];
  },

  async insertHabit(userId: string, habit: any) {
    if (isDbActive()) {
      const { data, error } = await supabase!
        .from('habits')
        .insert({ user_id: userId, ...habit })
        .select()
        .single();
      return { success: !error, data, error };
    }
    return { success: true, data: habit, error: null };
  },

  async deleteHabit(habitId: string) {
    if (isDbActive()) {
      const { error } = await supabase!
        .from('habits')
        .delete()
        .eq('id', habitId);
      return { success: !error, error };
    }
    return { success: true, error: null };
  },

  // --- Habit Logs ---
  async getHabitLogs(habitIds: string[]) {
    if (isDbActive() && habitIds.length > 0) {
      const { data, error } = await supabase!
        .from('habit_logs')
        .select('*')
        .in('habit_id', habitIds);
      if (!error) return data;
    }
    return [];
  },

  async logHabit(habitId: string, status: string, date: string) {
    if (isDbActive()) {
      const { error } = await supabase!
        .from('habit_logs')
        .upsert({ habit_id: habitId, status, logged_date: date });
      return { success: !error, error };
    }
    return { success: true, error: null };
  },

  // --- Subscriptions ---
  async getSubscriptions(userId: string) {
    if (isDbActive()) {
      const { data, error } = await supabase!
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId);
      if (!error) return data;
    }
    return [];
  },

  async insertSubscription(userId: string, sub: any) {
    if (isDbActive()) {
      const { data, error } = await supabase!
        .from('subscriptions')
        .insert({ user_id: userId, ...sub })
        .select()
        .single();
      return { success: !error, data, error };
    }
    return { success: true, data: sub, error: null };
  },

  async deleteSubscription(subId: string) {
    if (isDbActive()) {
      const { error } = await supabase!
        .from('subscriptions')
        .delete()
        .eq('id', subId);
      return { success: !error, error };
    }
    return { success: true, error: null };
  },

  async updateSubscription(subId: string, updateData: any) {
    if (isDbActive()) {
      const { error } = await supabase!
        .from('subscriptions')
        .update(updateData)
        .eq('id', subId);
      return { success: !error, error };
    }
    return { success: true, error: null };
  },

  // --- Expenses ---
  async getExpenses(userId: string) {
    if (isDbActive()) {
      const { data, error } = await supabase!
        .from('expenses')
        .select('*')
        .eq('user_id', userId);
      if (!error) return data;
    }
    return [];
  },

  async insertExpense(userId: string, exp: any) {
    if (isDbActive()) {
      const { data, error } = await supabase!
        .from('expenses')
        .insert({ user_id: userId, ...exp })
        .select()
        .single();
      return { success: !error, data, error };
    }
    return { success: true, data: exp, error: null };
  },

  async deleteExpense(expId: string) {
    if (isDbActive()) {
      const { error } = await supabase!
        .from('expenses')
        .delete()
        .eq('id', expId);
      return { success: !error, error };
    }
    return { success: true, error: null };
  },

  // --- Zakat Records ---
  async getZakatRecords(userId: string) {
    if (isDbActive()) {
      const { data, error } = await supabase!
        .from('zakat_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error) return data;
    }
    return [];
  },

  async insertZakatRecord(userId: string, record: any) {
    if (isDbActive()) {
      const { error } = await supabase!
        .from('zakat_records')
        .insert({ user_id: userId, ...record });
      return { success: !error, error };
    }
    return { success: true, error: null };
  },

  // --- Goals ---
  async getGoals(userId: string) {
    if (isDbActive()) {
      const { data, error } = await supabase!
        .from('goals')
        .select('*')
        .eq('user_id', userId);
      if (!error) return data;
    }
    return [];
  },

  async insertGoal(userId: string, goal: any) {
    if (isDbActive()) {
      const { data, error } = await supabase!
        .from('goals')
        .insert({ user_id: userId, ...goal })
        .select()
        .single();
      return { success: !error, data, error };
    }
    return { success: true, data: goal, error: null };
  },

  async deleteGoal(goalId: string) {
    if (isDbActive()) {
      const { error } = await supabase!
        .from('goals')
        .delete()
        .eq('id', goalId);
      return { success: !error, error };
    }
    return { success: true, error: null };
  },

  async updateGoal(goalId: string, updateData: any) {
    if (isDbActive()) {
      const { error } = await supabase!
        .from('goals')
        .update(updateData)
        .eq('id', goalId);
      return { success: !error, error };
    }
    return { success: true, error: null };
  },

  // --- Master User Synchronizer ---
  async fetchAllUserData(userId: string) {
    if (!isDbActive()) {
      return null;
    }
    try {
      const [
        profile,
        prayers,
        quran,
        dhikr,
        habits,
        subscriptions,
        expenses,
        zakat,
        goals
      ] = await Promise.all([
        this.getProfile(userId),
        this.getPrayerLogs(userId),
        this.getQuranProgress(userId),
        this.getDhikrLogs(userId),
        this.getHabits(userId),
        this.getSubscriptions(userId),
        this.getExpenses(userId),
        this.getZakatRecords(userId),
        this.getGoals(userId)
      ]);

      // Fetch habit logs in a second step once habit IDs are resolved
      const habitIds = habits.map((h: any) => h.id);
      const habitLogs = await this.getHabitLogs(habitIds);

      return {
        profile,
        prayers,
        quran,
        dhikr,
        habits,
        habitLogs,
        subscriptions,
        expenses,
        zakat,
        goals
      };
    } catch (e) {
      console.error('Failed fetching data sync', e);
      return null;
    }
  }
};
