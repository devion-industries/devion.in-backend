-- Add user_type column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'student' CHECK (user_type IN ('student', 'parent', 'teacher'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

-- Update existing users to be students
UPDATE users SET user_type = 'student' WHERE user_type IS NULL;

-- Make user_type NOT NULL after setting defaults
ALTER TABLE users ALTER COLUMN user_type SET NOT NULL;

-- Add user_type to user_profiles table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        ALTER TABLE user_profiles 
        ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) CHECK (user_type IN ('student', 'parent', 'teacher'));
    END IF;
END $$;

COMMENT ON COLUMN users.user_type IS 'Type of user account: student, parent, or teacher';



