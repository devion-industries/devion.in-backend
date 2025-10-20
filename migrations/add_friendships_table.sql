-- Create friendships table for friends leaderboard
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'accepted', -- accepted, pending, blocked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Add referral_code to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='referral_code') THEN
    ALTER TABLE users ADD COLUMN referral_code VARCHAR(20) UNIQUE;
  END IF;
END $$;

-- Generate unique referral codes for existing users
CREATE OR REPLACE FUNCTION generate_referral_code(user_alias TEXT, user_id UUID) RETURNS VARCHAR(20) AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Create base code from alias (first 6 chars uppercase, no spaces) + last 4 chars of UUID
  base_code := UPPER(REPLACE(LEFT(COALESCE(user_alias, 'USER'), 6), ' ', '')) || '-' || 
               UPPER(SUBSTRING(user_id::TEXT FROM 31 FOR 4));
  final_code := base_code;
  
  -- Ensure uniqueness
  LOOP
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = final_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
    -- If exists, append random number
    final_code := base_code || '-' || FLOOR(RANDOM() * 9999)::TEXT;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Update existing users with referral codes
DO $$
DECLARE
  user_record RECORD;
  new_code VARCHAR(20);
BEGIN
  FOR user_record IN SELECT id, alias FROM users WHERE referral_code IS NULL LOOP
    new_code := generate_referral_code(user_record.alias, user_record.id);
    UPDATE users SET referral_code = new_code WHERE id = user_record.id;
  END LOOP;
END $$;

-- Add NOT NULL constraint after populating
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='referral_code' AND is_nullable='YES') THEN
    ALTER TABLE users ALTER COLUMN referral_code SET NOT NULL;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- Add comments
COMMENT ON TABLE friendships IS 'Tracks friend connections between users for private leaderboards';
COMMENT ON COLUMN users.referral_code IS 'Unique code users can share with friends to connect';

