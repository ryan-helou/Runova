-- Add unit_preference column to profiles table
-- Run this in Supabase SQL Editor

-- Add unit_preference column with default 'km'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS unit_preference TEXT DEFAULT 'km' CHECK (unit_preference IN ('km', 'mi'));

-- Set default for existing rows
UPDATE profiles SET unit_preference = 'km' WHERE unit_preference IS NULL;

-- Add NOT NULL constraint after setting defaults
ALTER TABLE profiles ALTER COLUMN unit_preference SET NOT NULL;

-- Add distance_unit to training_plans (each plan stores its unit)
ALTER TABLE training_plans ADD COLUMN IF NOT EXISTS distance_unit TEXT DEFAULT 'km' CHECK (distance_unit IN ('km', 'mi'));

-- Set default for existing rows
UPDATE training_plans SET distance_unit = 'km' WHERE distance_unit IS NULL;

-- Add NOT NULL constraint after setting defaults
ALTER TABLE training_plans ALTER COLUMN distance_unit SET NOT NULL;
