-- Fix missing columns in training_plans table
-- Run this in Supabase SQL Editor

-- Add missing columns to training_plans if they don't exist
DO $$
BEGIN
    -- Add race_date column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'training_plans' AND column_name = 'race_date'
    ) THEN
        ALTER TABLE training_plans ADD COLUMN race_date DATE;
    END IF;

    -- Add training_frequency column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'training_plans' AND column_name = 'training_frequency'
    ) THEN
        ALTER TABLE training_plans ADD COLUMN training_frequency INTEGER;
    END IF;

    -- Add goal_time column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'training_plans' AND column_name = 'goal_time'
    ) THEN
        ALTER TABLE training_plans ADD COLUMN goal_time TEXT;
    END IF;

    -- Add personal_best_time column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'training_plans' AND column_name = 'personal_best_time'
    ) THEN
        ALTER TABLE training_plans ADD COLUMN personal_best_time TEXT;
    END IF;

    -- Add notes column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'training_plans' AND column_name = 'notes'
    ) THEN
        ALTER TABLE training_plans ADD COLUMN notes TEXT;
    END IF;

    -- Add special_events column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'training_plans' AND column_name = 'special_events'
    ) THEN
        ALTER TABLE training_plans ADD COLUMN special_events TEXT;
    END IF;

    -- Add injury_history column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'training_plans' AND column_name = 'injury_history'
    ) THEN
        ALTER TABLE training_plans ADD COLUMN injury_history TEXT;
    END IF;
END $$;

-- Set default value for training_frequency
UPDATE training_plans SET training_frequency = 4 WHERE training_frequency IS NULL;

-- Make training_frequency NOT NULL after setting defaults
ALTER TABLE training_plans ALTER COLUMN training_frequency SET NOT NULL;

-- Add constraint to training_frequency
ALTER TABLE training_plans DROP CONSTRAINT IF EXISTS training_plans_training_frequency_check;
ALTER TABLE training_plans ADD CONSTRAINT training_plans_training_frequency_check
    CHECK (training_frequency >= 1 AND training_frequency <= 7);

-- Clean up old columns from profiles table if they exist
ALTER TABLE profiles DROP COLUMN IF EXISTS experience_level;
ALTER TABLE profiles DROP COLUMN IF EXISTS running_goal;
ALTER TABLE profiles DROP COLUMN IF EXISTS current_weekly_mileage;
ALTER TABLE profiles DROP COLUMN IF EXISTS training_frequency;
ALTER TABLE profiles DROP COLUMN IF EXISTS target_race_date;
ALTER TABLE profiles DROP COLUMN IF EXISTS injury_history;
