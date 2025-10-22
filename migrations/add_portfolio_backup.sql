-- Migration: Add Portfolio Backup System for Cohort Join/Leave
-- Created: 2025-10-22
-- Description: Allows students to backup their portfolio when joining a cohort and restore when leaving

-- Create portfolio_backups table
CREATE TABLE IF NOT EXISTS portfolio_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  
  -- Original portfolio data (before joining cohort)
  original_portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  backup_data JSONB NOT NULL, -- Full snapshot of portfolio state
  
  -- Metadata
  backed_up_at TIMESTAMPTZ DEFAULT NOW(),
  restored_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Ensure one active backup per user-cohort pair
  UNIQUE(user_id, cohort_id, is_active)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_backups_user_id ON portfolio_backups(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_backups_cohort_id ON portfolio_backups(cohort_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_backups_active ON portfolio_backups(is_active) WHERE is_active = true;

-- Add cohort_portfolio relationship to portfolios table
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS is_cohort_portfolio BOOLEAN DEFAULT false;

-- Create index for cohort portfolios
CREATE INDEX IF NOT EXISTS idx_portfolios_cohort_id ON portfolios(cohort_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_is_cohort ON portfolios(is_cohort_portfolio);

-- Comments
COMMENT ON TABLE portfolio_backups IS 'Stores portfolio snapshots when students join cohorts';
COMMENT ON COLUMN portfolio_backups.backup_data IS 'JSONB snapshot of portfolio: cash, holdings, trades';
COMMENT ON COLUMN portfolios.cohort_id IS 'If set, this portfolio belongs to a cohort';
COMMENT ON COLUMN portfolios.is_cohort_portfolio IS 'True if portfolio was created for a cohort';

