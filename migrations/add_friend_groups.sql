-- Migration: Add Friend Groups System
-- Created: 2025-10-24
-- Description: Adds friend groups as peer-to-peer replacement for teacher cohorts

-- ===========================================
-- 1. CREATE friend_groups TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS friend_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_code VARCHAR(10) UNIQUE NOT NULL,
  is_private BOOLEAN DEFAULT false,
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_friend_groups_entry_code ON friend_groups(entry_code);
CREATE INDEX IF NOT EXISTS idx_friend_groups_created_by ON friend_groups(created_by);

-- ===========================================
-- 2. CREATE friend_group_members TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS friend_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES friend_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- creator, admin, member
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure a user can only join a group once
  UNIQUE(group_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_friend_group_members_group_id ON friend_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_friend_group_members_user_id ON friend_group_members(user_id);

-- ===========================================
-- 3. CREATE FUNCTION: Generate Unique Group Code
-- ===========================================
CREATE OR REPLACE FUNCTION generate_group_code() RETURNS VARCHAR(10) AS $$
DECLARE
  code_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- No confusing chars (0,O,I,1)
  random_code TEXT := '';
  code_exists BOOLEAN := TRUE;
  final_code TEXT;
BEGIN
  WHILE code_exists LOOP
    -- Generate 4 random characters
    random_code := '';
    FOR i IN 1..4 LOOP
      random_code := random_code || substr(code_chars, floor(random() * length(code_chars) + 1)::int, 1);
    END LOOP;
    
    -- Format: GROUP-XXXX (e.g., GROUP-7B4K)
    final_code := 'GROUP-' || random_code;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM friend_groups WHERE entry_code = final_code) INTO code_exists;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 4. CREATE FUNCTION: Get Group Leaderboard
-- ===========================================
CREATE OR REPLACE FUNCTION get_group_leaderboard(
  p_group_id UUID,
  current_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  alias VARCHAR,
  portfolio_return DECIMAL,
  badges_count INTEGER,
  login_streak INTEGER,
  is_current_user BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH group_members AS (
    SELECT fgm.user_id
    FROM friend_group_members fgm
    WHERE fgm.group_id = p_group_id
  ),
  portfolio_stats AS (
    SELECT 
      u.id AS user_id,
      u.alias,
      COALESCE(
        CASE 
          WHEN p.budget_amount > 0 
          THEN ((p.total_value - p.budget_amount) / p.budget_amount * 100)
          ELSE 0 
        END, 
        0
      ) AS portfolio_return,
      COALESCE(
        (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = u.id AND ub.unlocked_at IS NOT NULL),
        0
      ) AS badges_count,
      COALESCE(u.login_streak, 0) AS login_streak
    FROM users u
    LEFT JOIN portfolios p ON u.id = p.user_id
    WHERE u.id IN (SELECT user_id FROM group_members)
      AND u.user_type = 'student'
  )
  SELECT 
    ROW_NUMBER() OVER (
      ORDER BY 
        ps.portfolio_return DESC,
        ps.badges_count DESC,
        ps.login_streak DESC
    ) AS rank,
    ps.user_id,
    ps.alias,
    ps.portfolio_return,
    ps.badges_count::INTEGER,
    ps.login_streak::INTEGER,
    (ps.user_id = current_user_id) AS is_current_user
  FROM portfolio_stats ps
  ORDER BY rank;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 5. ADD TRIGGER: Update updated_at timestamp
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_friend_groups_updated_at ON friend_groups;
CREATE TRIGGER update_friend_groups_updated_at
  BEFORE UPDATE ON friend_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 6. VERIFICATION QUERIES
-- ===========================================
-- Check tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('friend_groups', 'friend_group_members')
ORDER BY table_name;

-- Test code generation
SELECT generate_group_code() AS sample_code;

-- ===========================================
-- MIGRATION COMPLETE ✅
-- ===========================================
-- Tables: friend_groups, friend_group_members
-- Functions: generate_group_code(), get_group_leaderboard()
-- Indexes: Created for entry_code, created_by, group_id, user_id
-- Triggers: Auto-update updated_at on friend_groups



