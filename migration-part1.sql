-- MIGRATION PART 1: Add 'custom' to enum
-- Run this FIRST, then run migration-part2.sql

-- Add 'custom' to the running_goal enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'custom' AND enumtypid = 'running_goal'::regtype) THEN
        ALTER TYPE running_goal ADD VALUE 'custom';
    END IF;
END $$;
