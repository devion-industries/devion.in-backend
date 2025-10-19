-- Migration: Add Cohort Entry Code System
-- Created: 2024-10-19
-- Description: Adds entry codes to cohorts and creates cohort_members table for student joining

-- Add entry_code column to cohorts table (if cohorts table exists)
-- If cohorts table doesn't exist, create it first
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grade VARCHAR(50),
  subject VARCHAR(100),
  default_budget DECIMAL(15, 2) DEFAULT 10000.00,
  allow_custom_budget BOOLEAN DEFAULT true,
  restricted_stocks BOOLEAN DEFAULT false,
  allowed_sectors TEXT[], -- Array of sector names
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add entry_code column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='cohorts' AND column_name='entry_code'
  ) THEN
    ALTER TABLE cohorts ADD COLUMN entry_code VARCHAR(8) UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8);
  END IF;
END $$;

-- Create index on entry_code for fast lookups
CREATE INDEX IF NOT EXISTS idx_cohorts_entry_code ON cohorts(entry_code);
CREATE INDEX IF NOT EXISTS idx_cohorts_teacher_id ON cohorts(teacher_id);

-- Create cohort_members table for tracking student memberships
CREATE TABLE IF NOT EXISTS cohort_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active', -- active, removed
  
  -- Ensure a user can only join a cohort once
  UNIQUE(cohort_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cohort_members_cohort_id ON cohort_members(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_user_id ON cohort_members(user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_status ON cohort_members(status);

-- Function to generate readable entry codes (excluding ambiguous characters)
CREATE OR REPLACE FUNCTION generate_entry_code() RETURNS VARCHAR(8) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excludes O, 0, I, 1, L
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update existing cohorts with unique entry codes
DO $$
DECLARE
  cohort_record RECORD;
  new_code VARCHAR(8);
  code_exists BOOLEAN;
BEGIN
  FOR cohort_record IN SELECT id FROM cohorts WHERE entry_code IS NULL OR entry_code = '' LOOP
    LOOP
      new_code := generate_entry_code();
      SELECT EXISTS(SELECT 1 FROM cohorts WHERE entry_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    UPDATE cohorts SET entry_code = new_code WHERE id = cohort_record.id;
  END LOOP;
END $$;

-- Add comment to tables
COMMENT ON TABLE cohorts IS 'Teacher-created groups/classes for organizing students';
COMMENT ON TABLE cohort_members IS 'Tracks which students belong to which cohorts';
COMMENT ON COLUMN cohorts.entry_code IS 'Unique 8-character code that students use to join the cohort';

