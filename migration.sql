-- Migration script to add new columns to training_plans table
-- Run this in your Supabase SQL Editor

-- Step 1: Update the running_goal enum to add 'custom' if it doesn't exist
DO $$
BEGIN
    -- Add 'custom' to the enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'custom' AND enumtypid = 'running_goal'::regtype) THEN
        ALTER TYPE running_goal ADD VALUE 'custom';
    END IF;
END $$;

-- Step 2: Update any existing 'general_fitness' values to 'custom'
-- (In case you have old data with that value)
UPDATE training_plans SET goal = 'custom' WHERE goal::text = 'general_fitness';

-- Step 3: Remove old columns from profiles table (if they exist)
ALTER TABLE profiles DROP COLUMN IF EXISTS experience_level;
ALTER TABLE profiles DROP COLUMN IF EXISTS running_goal;
ALTER TABLE profiles DROP COLUMN IF EXISTS current_weekly_mileage;
ALTER TABLE profiles DROP COLUMN IF EXISTS training_frequency;
ALTER TABLE profiles DROP COLUMN IF EXISTS target_race_date;
ALTER TABLE profiles DROP COLUMN IF EXISTS injury_history;

-- Step 4: Add new columns to training_plans table
ALTER TABLE training_plans
  ADD COLUMN IF NOT EXISTS training_frequency INTEGER,
  ADD COLUMN IF NOT EXISTS goal_time TEXT,
  ADD COLUMN IF NOT EXISTS personal_best_time TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS special_events TEXT,
  ADD COLUMN IF NOT EXISTS injury_history TEXT;

-- Step 5: Add constraint to training_frequency
ALTER TABLE training_plans
  DROP CONSTRAINT IF EXISTS training_plans_training_frequency_check;

ALTER TABLE training_plans
  ADD CONSTRAINT training_plans_training_frequency_check
  CHECK (training_frequency >= 1 AND training_frequency <= 7);

-- Step 6: Set default values for training_frequency for existing plans (if any)
UPDATE training_plans SET training_frequency = 4 WHERE training_frequency IS NULL;
