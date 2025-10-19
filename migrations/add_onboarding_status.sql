-- Add onboarding_completed field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add onboarding_completed field to user_profiles table as well
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding_completed);

-- Set existing users as onboarding completed
UPDATE users SET onboarding_completed = TRUE WHERE created_at < NOW();

COMMENT ON COLUMN users.onboarding_completed IS 'Whether user has completed onboarding flow';
COMMENT ON COLUMN user_profiles.onboarding_completed IS 'Whether user has completed onboarding flow';

