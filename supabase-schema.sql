-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE running_goal AS ENUM ('5k', '10k', 'half_marathon', 'marathon', 'custom');
CREATE TYPE workout_type AS ENUM ('easy_run', 'long_run', 'tempo', 'intervals', 'recovery', 'rest');
CREATE TYPE effort_level AS ENUM ('easy', 'moderate', 'hard', 'very_hard');

-- Profiles table (simplified - just basic user info)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT NOT NULL,
  full_name TEXT
);

-- Training plans table (all plan-specific data stored here)
CREATE TABLE training_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  goal running_goal NOT NULL,
  training_frequency INTEGER NOT NULL CHECK (training_frequency >= 1 AND training_frequency <= 7),
  race_date DATE,
  goal_time TEXT,
  personal_best_time TEXT,
  notes TEXT,
  special_events TEXT,
  injury_history TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  weekly_schedule JSONB NOT NULL,
  ai_recommendations TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Workout logs table
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  training_plan_id UUID REFERENCES training_plans(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  workout_type workout_type NOT NULL,
  planned_distance DECIMAL,
  actual_distance DECIMAL,
  planned_duration INTEGER,
  actual_duration INTEGER,
  effort_level effort_level,
  notes TEXT,
  completed BOOLEAN DEFAULT false
);

-- Create indexes for better query performance
CREATE INDEX idx_training_plans_user_id ON training_plans(user_id);
CREATE INDEX idx_training_plans_is_active ON training_plans(is_active);
CREATE INDEX idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX idx_workout_logs_date ON workout_logs(date);
CREATE INDEX idx_workout_logs_training_plan_id ON workout_logs(training_plan_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Training plans policies
CREATE POLICY "Users can view their own training plans"
  ON training_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training plans"
  ON training_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training plans"
  ON training_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training plans"
  ON training_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Workout logs policies
CREATE POLICY "Users can view their own workout logs"
  ON workout_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout logs"
  ON workout_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout logs"
  ON workout_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout logs"
  ON workout_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_plans_updated_at
  BEFORE UPDATE ON training_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
