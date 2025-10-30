-- ============================================
-- DEVION LESSONS SYSTEM - DATABASE SCHEMA
-- Scalable module and lesson structure
-- ============================================

-- ============================================
-- 1. MODULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_index INTEGER NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- emoji or icon name
  color VARCHAR(50), -- for UI theming
  estimated_time VARCHAR(50), -- e.g., "4-5 weeks"
  difficulty_level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX idx_modules_order ON modules(order_index);
CREATE INDEX idx_modules_published ON modules(is_published);

-- ============================================
-- 2. LESSONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  lesson_number VARCHAR(10) NOT NULL, -- e.g., "1.1", "2.3"
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content_type VARCHAR(20) DEFAULT 'card_sequence', -- card_sequence, video, reading
  estimated_time INTEGER DEFAULT 15, -- in minutes
  difficulty_level INTEGER DEFAULT 1, -- 1 (13-14), 2 (15-16), 3 (17-18)
  prerequisites TEXT[], -- array of lesson_ids
  learning_outcomes TEXT[],
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, order_index)
);

-- Indexes
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_lessons_order ON lessons(module_id, order_index);
CREATE INDEX idx_lessons_published ON lessons(is_published);
CREATE INDEX idx_lessons_difficulty ON lessons(difficulty_level);

-- ============================================
-- 3. LESSON CARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  card_type VARCHAR(30) NOT NULL, -- NOTE, CONCEPT, ANALOGY, DEFINITION, EXAMPLE, NOTE_HIGHLIGHT, PRACTICE, SUMMARY
  title VARCHAR(200),
  content TEXT NOT NULL,
  metadata JSONB, -- flexible storage for card-specific data
  styling JSONB, -- background, border, icon, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, order_index)
);

-- Indexes
CREATE INDEX idx_lesson_cards_lesson ON lesson_cards(lesson_id);
CREATE INDEX idx_lesson_cards_order ON lesson_cards(lesson_id, order_index);
CREATE INDEX idx_lesson_cards_type ON lesson_cards(card_type);

-- ============================================
-- 4. LESSON QUIZZES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- array of options
  correct_answer INTEGER NOT NULL, -- index of correct option
  explanation TEXT,
  difficulty_level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, order_index)
);

-- Index
CREATE INDEX idx_lesson_quizzes_lesson ON lesson_quizzes(lesson_id);

-- ============================================
-- 5. USER LESSON PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, completed
  current_card_index INTEGER DEFAULT 0,
  cards_completed INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  quiz_score DECIMAL(5,2), -- percentage
  quiz_attempts INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson ON user_lesson_progress(lesson_id);
CREATE INDEX idx_user_lesson_progress_status ON user_lesson_progress(status);
CREATE INDEX idx_user_lesson_progress_user_status ON user_lesson_progress(user_id, status);

-- ============================================
-- 6. USER MODULE PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  lessons_completed INTEGER DEFAULT 0,
  lessons_total INTEGER DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  started_at TIMESTAMPTZ,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Indexes
CREATE INDEX idx_user_module_progress_user ON user_module_progress(user_id);
CREATE INDEX idx_user_module_progress_module ON user_module_progress(module_id);

-- ============================================
-- 7. LESSON TAGS TABLE (for filtering)
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(50), -- Fundamentals, Trading, Analysis, Risk Management
  color VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. LESSON_TAGS JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_tag_assignments (
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES lesson_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (lesson_id, tag_id)
);

-- Indexes
CREATE INDEX idx_lesson_tag_assignments_lesson ON lesson_tag_assignments(lesson_id);
CREATE INDEX idx_lesson_tag_assignments_tag ON lesson_tag_assignments(tag_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lesson_progress_updated_at BEFORE UPDATE ON user_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_module_progress_updated_at BEFORE UPDATE ON user_module_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function to calculate module progress
-- ============================================
CREATE OR REPLACE FUNCTION calculate_module_progress(p_user_id UUID, p_module_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total INTEGER;
  v_completed INTEGER;
  v_percentage DECIMAL(5,2);
BEGIN
  -- Get total lessons in module
  SELECT COUNT(*) INTO v_total
  FROM lessons
  WHERE module_id = p_module_id AND is_published = true;

  -- Get completed lessons
  SELECT COUNT(*) INTO v_completed
  FROM user_lesson_progress ulp
  JOIN lessons l ON ulp.lesson_id = l.id
  WHERE ulp.user_id = p_user_id 
    AND l.module_id = p_module_id
    AND ulp.status = 'completed';

  -- Calculate percentage
  IF v_total > 0 THEN
    v_percentage := (v_completed::DECIMAL / v_total::DECIMAL) * 100;
  ELSE
    v_percentage := 0;
  END IF;

  -- Update or insert module progress
  INSERT INTO user_module_progress (user_id, module_id, lessons_completed, lessons_total, progress_percentage)
  VALUES (p_user_id, p_module_id, v_completed, v_total, v_percentage)
  ON CONFLICT (user_id, module_id) 
  DO UPDATE SET 
    lessons_completed = v_completed,
    lessons_total = v_total,
    progress_percentage = v_percentage,
    last_accessed = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger to update module progress when lesson is completed
-- ============================================
CREATE OR REPLACE FUNCTION update_module_progress_on_lesson_complete()
RETURNS TRIGGER AS $$
DECLARE
  v_module_id UUID;
BEGIN
  -- Get module_id for this lesson
  SELECT module_id INTO v_module_id
  FROM lessons
  WHERE id = NEW.lesson_id;

  -- Recalculate module progress
  PERFORM calculate_module_progress(NEW.user_id, v_module_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_module_progress_trigger
AFTER INSERT OR UPDATE ON user_lesson_progress
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION update_module_progress_on_lesson_complete();

-- ============================================
-- SEED DATA: Tags
-- ============================================
INSERT INTO lesson_tags (name, category, color) VALUES
  ('Fundamentals', 'Fundamentals', 'green'),
  ('Trading', 'Trading', 'blue'),
  ('Analysis', 'Analysis', 'purple'),
  ('Valuation', 'Analysis', 'purple'),
  ('Risk Management', 'Risk Management', 'orange'),
  ('Portfolio', 'Portfolio', 'cyan'),
  ('Advanced', 'Advanced', 'red'),
  ('Beginner Friendly', 'Level', 'green'),
  ('Practical', 'Type', 'blue')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SAMPLE MODULE DATA
-- ============================================
INSERT INTO modules (order_index, title, description, icon, color, estimated_time, is_published) VALUES
  (1, 'Money & Investing Fundamentals', 'Learn the basics of money, investing, and why the stock market exists', '💰', 'blue', '2-3 weeks', true),
  (2, 'Understanding Stocks & Markets', 'Master how stocks work, market indices, and trading basics', '📈', 'green', '3-4 weeks', true),
  (3, 'Company Analysis & Research', 'Learn to analyze companies using financial ratios and statements', '🔍', 'purple', '3-4 weeks', true),
  (4, 'Risk & Portfolio Management', 'Build a balanced portfolio and manage investment risk effectively', '🛡️', 'orange', '4-5 weeks', true),
  (5, 'Advanced Investment Concepts', 'Explore technical analysis, market psychology, and investment styles', '🎓', 'red', '3-4 weeks', true),
  (6, 'Practical Trading Skills', 'Develop real-world trading skills and avoid common mistakes', '🎯', 'cyan', '3-4 weeks', true),
  (7, 'Financial Responsibility', 'Learn ethical investing, scam prevention, and personal finance basics', '⚖️', 'indigo', '2-3 weeks', true)
ON CONFLICT (order_index) DO NOTHING;

-- ============================================
-- VIEWS FOR EASIER QUERYING
-- ============================================

-- View: Module progress summary
CREATE OR REPLACE VIEW module_progress_summary AS
SELECT 
  m.id AS module_id,
  m.order_index,
  m.title AS module_title,
  m.icon,
  m.color,
  ump.user_id,
  ump.lessons_completed,
  ump.lessons_total,
  ump.progress_percentage,
  ump.last_accessed
FROM modules m
LEFT JOIN user_module_progress ump ON m.id = ump.module_id
WHERE m.is_published = true
ORDER BY m.order_index;

-- View: User's lesson progress with details
CREATE OR REPLACE VIEW user_lesson_details AS
SELECT 
  ulp.user_id,
  l.id AS lesson_id,
  l.lesson_number,
  l.title AS lesson_title,
  l.description,
  l.estimated_time,
  l.difficulty_level,
  m.id AS module_id,
  m.title AS module_title,
  m.order_index AS module_order,
  ulp.status,
  ulp.current_card_index,
  ulp.cards_completed,
  ulp.time_spent,
  ulp.quiz_score,
  ulp.last_accessed,
  ulp.completed_at
FROM lessons l
JOIN modules m ON l.module_id = m.id
LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id
WHERE l.is_published = true AND m.is_published = true
ORDER BY m.order_index, l.order_index;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;

-- Policies for user_lesson_progress
CREATE POLICY "Users can view their own progress"
  ON user_lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for user_module_progress
CREATE POLICY "Users can view their own module progress"
  ON user_module_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own module progress"
  ON user_module_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own module progress"
  ON user_module_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Composite indexes for common queries
CREATE INDEX idx_lessons_module_published ON lessons(module_id, is_published);
CREATE INDEX idx_user_lesson_progress_user_lesson ON user_lesson_progress(user_id, lesson_id);
CREATE INDEX idx_lesson_cards_lesson_order ON lesson_cards(lesson_id, order_index);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE modules IS 'Main learning modules (7 core modules)';
COMMENT ON TABLE lessons IS 'Individual lessons within modules (34 lessons total)';
COMMENT ON TABLE lesson_cards IS 'Card-based content for each lesson (8-12 cards per lesson)';
COMMENT ON TABLE lesson_quizzes IS 'Quiz questions for each lesson (5 MCQs per lesson)';
COMMENT ON TABLE user_lesson_progress IS 'Tracks user progress through lessons';
COMMENT ON TABLE user_module_progress IS 'Aggregated progress at module level';
COMMENT ON TABLE lesson_tags IS 'Tags for filtering and categorizing lessons';

-- ============================================
-- END OF SCHEMA
-- ============================================



