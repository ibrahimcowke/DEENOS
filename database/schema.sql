-- DEENOS™ Database Schema
-- Ultimate Muslim Life Operating System
-- Target: PostgreSQL / Supabase DB

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS & PROFILES
-- ==========================================

-- Standard user profile linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    onboarded BOOLEAN DEFAULT FALSE,
    goals_selected TEXT[] DEFAULT '{}',
    learning_style TEXT DEFAULT 'visual',
    reminder_preferences TEXT DEFAULT 'push',
    productivity_style TEXT DEFAULT 'focused',
    current_level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    deen_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. SETTINGS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'emerald-night',
    language TEXT DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    prayer_reminders JSONB DEFAULT '{"fajr": true, "dhuhr": true, "asr": true, "maghrib": true, "isha": true}'::jsonb,
    privacy_mode BOOLEAN DEFAULT FALSE,
    security_double_auth BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_settings UNIQUE(user_id)
);

-- ==========================================
-- 3. WORSHIP (SALAH, QURAN, DHIKR)
-- ==========================================

-- Standard prayers reference table
CREATE TABLE IF NOT EXISTS public.prayers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    default_time TIME NOT NULL,
    description TEXT
);

-- Logs for logged prayers
CREATE TABLE IF NOT EXISTS public.prayer_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prayer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    prayer_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('completed', 'mosque', 'congregation', 'missed', 'delayed', 'outside')),
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_prayer_date UNIQUE(user_id, prayer_date, prayer_name)
);

-- Quran reading tracker
CREATE TABLE IF NOT EXISTS public.quran_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INTEGER NOT NULL,
    page_number INTEGER NOT NULL CHECK (page_number BETWEEN 1 AND 604),
    juz_number INTEGER NOT NULL CHECK (juz_number BETWEEN 1 AND 30),
    total_pages_read INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_read_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quran memorization tracker
CREATE TABLE IF NOT EXISTS public.memorization_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    start_ayah INTEGER NOT NULL,
    end_ayah INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('memorizing', 'reviewed', 'completed')),
    last_reviewed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dhikr Digital Tasbih logs
CREATE TABLE IF NOT EXISTS public.dhikr_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    dhikr_name TEXT NOT NULL,
    count INTEGER NOT NULL CHECK (count >= 0),
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. HABIT SYSTEM (SPIRITUAL GARDEN)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('worship', 'health', 'learning', 'productivity', 'finance', 'family', 'custom')),
    frequency TEXT NOT NULL DEFAULT 'daily',
    is_custom BOOLEAN DEFAULT FALSE,
    plant_type TEXT DEFAULT 'flower',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('completed', 'skipped', 'missed')),
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_habit_date UNIQUE(habit_id, logged_date)
);

CREATE TABLE IF NOT EXISTS public.habit_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    CONSTRAINT unique_habit_streak UNIQUE(habit_id)
);

-- ==========================================
-- 5. GOALS SYSTEM
-- ==========================================

CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('deen', 'finance', 'habits', 'reading', 'personal')),
    target_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    ai_plan JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.goal_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    progress_percentage NUMERIC(5,2) DEFAULT 0.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. JOURNAL SYSTEM
-- ==========================================

CREATE TABLE IF NOT EXISTS public.journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'My Deen Journal',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    prompt TEXT,
    response TEXT NOT NULL,
    mood TEXT NOT NULL,
    ai_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. FINANCE HUB (EXPENSES & SUBSCRIPTIONS)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL CHECK (category IN ('food', 'family', 'education', 'business', 'charity', 'entertainment', 'bills', 'custom')),
    description TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly')),
    next_billing_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'failed', 'refunded'))
);

CREATE TABLE IF NOT EXISTS public.charity_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    recipient TEXT NOT NULL,
    charity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT DEFAULT 'sadaqah' CHECK (type IN ('sadaqah', 'zakat', 'lillah')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.zakat_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    calculated_year INTEGER NOT NULL,
    net_assets NUMERIC(12,2) NOT NULL CHECK (net_assets >= 0),
    zakat_due NUMERIC(12,2) NOT NULL CHECK (zakat_due >= 0),
    status TEXT DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 8. GAMIFICATION
-- ==========================================

CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    badge_url TEXT,
    xp_reward INTEGER DEFAULT 100,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'epic'))
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_achievement UNIQUE(user_id, achievement_id)
);

-- ==========================================
-- 9. COMMUNITY
-- ==========================================

CREATE TABLE IF NOT EXISTS public.community_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_group_member UNIQUE(group_id, user_id)
);

-- ==========================================
-- 10. SYSTEM NOTIFICATIONS & AI CHAT
-- ==========================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    coach_mode TEXT NOT NULL CHECK (coach_mode IN ('deen', 'productivity', 'habit', 'quran', 'finance')),
    message_role TEXT NOT NULL CHECK (message_role IN ('user', 'assistant')),
    message_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES & TRIGGERS FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_prayer_logs_user_date ON public.prayer_logs(user_id, prayer_date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON public.habit_logs(habit_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON public.journal_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_mode ON public.ai_conversations(user_id, coach_mode);

-- Trigger to auto-create profile and settings on auth.users signup
-- (Note: Run this inside Supabase dashboard when user triggers signup)
/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
*/
