-- ============================================
-- TEMPLATE: Adding New Lessons to Devion
-- ============================================
-- Use this template to add new modules and lessons
-- Replace placeholders with actual content

-- ============================================
-- STEP 1: Add a New Module (Optional)
-- ============================================
-- Only needed if creating a completely new module

INSERT INTO modules (
  order_index,        -- Next available number (e.g., 8, 9, 10)
  title,              -- Module title (e.g., "Options & Derivatives")
  description,        -- Brief description
  icon,               -- Emoji (e.g., '📊', '💎', '🎓')
  color,              -- Color theme (blue, green, purple, orange, red, cyan, indigo, yellow)
  estimated_time,     -- e.g., "3-4 weeks"
  is_published        -- true or false
) VALUES (
  8,
  'Advanced Trading Strategies',
  'Master advanced trading techniques and risk management',
  '🎓',
  'yellow',
  '4-5 weeks',
  true
) RETURNING id;
-- Save the returned ID as <MODULE_ID>

-- ============================================
-- STEP 2: Add Lessons to the Module
-- ============================================
-- Add 4-6 lessons per module

INSERT INTO lessons (
  module_id,          -- UUID from Step 1
  order_index,        -- 1, 2, 3, 4... (order within module)
  lesson_number,      -- Format: "8.1", "8.2", etc.
  title,              -- Lesson title
  description,        -- Brief description (1-2 sentences)
  estimated_time,     -- Time in minutes (10-20 typical)
  difficulty_level,   -- 1 (13-14), 2 (15-16), 3 (17-18)
  prerequisites,      -- Array of prerequisite lesson_ids (can be null)
  learning_outcomes,  -- Array of learning outcomes
  is_published        -- true or false
) VALUES 
-- Lesson 8.1
(
  '<MODULE_ID>',
  1,
  '8.1',
  'Introduction to Options',
  'Learn what options are and how call and put options work',
  20,
  3,
  ARRAY['7.1', '7.2']::TEXT[],
  ARRAY[
    'Understand what options contracts are',
    'Differentiate between call and put options',
    'Recognize basic options terminology'
  ]::TEXT[],
  true
),
-- Lesson 8.2
(
  '<MODULE_ID>',
  2,
  '8.2',
  'Options Pricing Basics',
  'Understand factors that affect option prices',
  18,
  3,
  ARRAY['8.1']::TEXT[],
  ARRAY[
    'Understand intrinsic and time value',
    'Learn about options Greeks basics',
    'Recognize factors affecting options pricing'
  ]::TEXT[],
  true
)
RETURNING id;
-- Save the returned IDs as <LESSON_8.1_ID>, <LESSON_8.2_ID>

-- ============================================
-- STEP 3: Add Lesson Cards (8-12 per lesson)
-- ============================================
-- Card types: NOTE, CONCEPT, ANALOGY, DEFINITION, EXAMPLE, NOTE_HIGHLIGHT, PRACTICE, SUMMARY

-- Cards for Lesson 8.1
INSERT INTO lesson_cards (lesson_id, order_index, card_type, title, content, styling) VALUES

-- Card 1: Introduction NOTE
('<LESSON_8.1_ID>', 0, 'NOTE', 'Introduction to Options',
'Options are powerful financial instruments that give you the right, but not the obligation, to buy or sell a stock at a predetermined price. Understanding options opens up advanced trading strategies!',
'{"background": "bg-blue-50", "border": "border-blue-200", "icon": "📘"}'::jsonb),

-- Card 2: Main CONCEPT
('<LESSON_8.1_ID>', 1, 'CONCEPT', 'What Are Options?',
'• Options are contracts that give you rights to buy or sell stocks
• Call option = Right to **buy** at strike price
• Put option = Right to **sell** at strike price
• You pay a **premium** to buy options
• Options have expiration dates',
'{"icon": "💡"}'::jsonb),

-- Card 3: ANALOGY
('<LESSON_8.1_ID>', 2, 'ANALOGY', 'Simple Analogy',
'Think of a call option like booking a movie ticket in advance. You pay a small fee (premium) today for the right to watch the movie (buy the stock) at a fixed price, even if ticket prices increase. If you don''t want to watch, you just lose the booking fee.',
'{"background": "bg-orange-50", "border": "border-orange-200", "icon": "🎯"}'::jsonb),

-- Card 4: DEFINITION (Call Option)
('<LESSON_8.1_ID>', 3, 'DEFINITION', 'Call Option',
'A call option gives you the **right to buy** a stock at a specific price (strike price) before the expiration date. Buyers hope the stock price will rise.',
'{"background": "bg-red-50", "border": "border-red-300", "icon": "📖"}'::jsonb),

-- Card 5: DEFINITION (Put Option)
('<LESSON_8.1_ID>', 4, 'DEFINITION', 'Put Option',
'A put option gives you the **right to sell** a stock at a specific price (strike price) before the expiration date. Buyers hope the stock price will fall.',
'{"background": "bg-red-50", "border": "border-red-300", "icon": "📖"}'::jsonb),

-- Card 6: EXAMPLE
('<LESSON_8.1_ID>', 5, 'EXAMPLE', 'Real Example',
'Example: TCS stock is trading at ₹3,500. You buy a call option with strike price ₹3,600 for ₹100 premium. If TCS rises to ₹3,800, you can buy at ₹3,600 and sell at ₹3,800, making ₹200 profit minus ₹100 premium = ₹100 gain. If TCS stays below ₹3,600, you lose only the ₹100 premium.',
'{"background": "bg-blue-100", "border": "border-blue-200", "icon": "ℹ️"}'::jsonb),

-- Card 7: NOTE_HIGHLIGHT
('<LESSON_8.1_ID>', 6, 'NOTE_HIGHLIGHT', 'Important Note',
'Note: Options are advanced instruments with higher risk. The maximum loss for option buyers is limited to the premium paid, but options can expire worthless.',
'{"background": "bg-green-50", "border": "border-green-200", "icon": "✏️"}'::jsonb),

-- Card 8: PRACTICE
('<LESSON_8.1_ID>', 7, 'PRACTICE', 'Your Turn',
'Practice identifying options opportunities:
• Go to the Market page
• Find a stock you''ve been watching
• Think: Would you want the right to buy (call) or sell (put) it?
• Consider what strike price would make sense',
'{"icon": "🎯"}'::jsonb),

-- Card 9: SUMMARY
('<LESSON_8.1_ID>', 8, 'SUMMARY', 'Key Takeaways',
'• Options give rights, not obligations, to buy or sell stocks
• Call options = right to buy (bullish)
• Put options = right to sell (bearish)
• You pay a premium to purchase options
• Options have expiration dates and strike prices
• Max loss for buyers = premium paid',
'{"icon": "✨"}'::jsonb);

-- ============================================
-- STEP 4: Add Quiz Questions (5 MCQs per lesson)
-- ============================================

INSERT INTO lesson_quizzes (lesson_id, order_index, question, options, correct_answer, explanation, difficulty_level) VALUES

('<LESSON_8.1_ID>', 0,
'What does a call option give you?',
'[
  "The obligation to buy a stock at strike price",
  "The right to buy a stock at strike price",
  "The right to sell a stock at strike price",
  "The obligation to sell a stock at strike price"
]'::jsonb,
1,
'A call option gives you the **right** (not obligation) to **buy** a stock at the strike price. You can choose whether to exercise this right.',
3),

('<LESSON_8.1_ID>', 1,
'What is the maximum loss for an option buyer?',
'[
  "Unlimited",
  "The strike price",
  "The premium paid",
  "The stock price"
]'::jsonb,
2,
'The maximum loss for an option buyer is limited to the **premium paid** to purchase the option. Even if the option expires worthless, you only lose the premium.',
3),

('<LESSON_8.1_ID>', 2,
'Which type of option would you buy if you expect the stock price to rise?',
'[
  "Put option",
  "Call option",
  "Both",
  "Neither"
]'::jsonb,
1,
'You would buy a **call option** if you expect the stock price to rise, as it gives you the right to buy at a lower strike price.',
3),

('<LESSON_8.1_ID>', 3,
'What happens if your option expires "out of the money"?',
'[
  "You get your premium back",
  "The option is automatically exercised",
  "The option expires worthless",
  "You must buy the stock"
]'::jsonb,
2,
'If an option expires "out of the money" (not profitable), it **expires worthless** and you lose the premium you paid.',
3),

('<LESSON_8.1_ID>', 4,
'TCS stock is at ₹3,500. You buy a call option with strike ₹3,600 for ₹100. TCS rises to ₹3,700. What is your profit if you exercise?',
'[
  "₹100",
  "₹200",
  "₹0 (loss of ₹100)",
  "₹700"
]'::jsonb,
2,
'You can buy at ₹3,600 (strike) and sell at ₹3,700 (market) = ₹100 gain. Minus ₹100 premium paid = **₹0 net** (breakeven). You recover your premium but make no profit.',
3);

-- ============================================
-- STEP 5: Add Tags (Optional)
-- ============================================
-- Tag the lesson for better filtering

-- First, get or create tag
INSERT INTO lesson_tags (name, category, color) VALUES
  ('Advanced', 'Level', 'red'),
  ('Options', 'Topic', 'purple')
ON CONFLICT (name) DO NOTHING
RETURNING id;
-- Save IDs as <TAG_ID_ADVANCED>, <TAG_ID_OPTIONS>

-- Then assign tags to lesson
INSERT INTO lesson_tag_assignments (lesson_id, tag_id) VALUES
  ('<LESSON_8.1_ID>', '<TAG_ID_ADVANCED>'),
  ('<LESSON_8.1_ID>', '<TAG_ID_OPTIONS>');

-- ============================================
-- STEP 6: Verify the Lesson
-- ============================================

-- Check lesson was created
SELECT * FROM lessons WHERE id = '<LESSON_8.1_ID>';

-- Check cards were created (should have 8-12)
SELECT COUNT(*) FROM lesson_cards WHERE lesson_id = '<LESSON_8.1_ID>';

-- Check quiz questions were created (should have 5)
SELECT COUNT(*) FROM lesson_quizzes WHERE lesson_id = '<LESSON_8.1_ID>';

-- ============================================
-- COMMON CARD TYPE PATTERNS
-- ============================================

/*
TYPICAL LESSON CARD SEQUENCE (10 cards):

1. NOTE - Introduction
2. CONCEPT - Main idea with bullets
3. ANALOGY - Relatable comparison
4. DEFINITION - Key term 1
5. DEFINITION - Key term 2
6. EXAMPLE - Specific numerical example
7. NOTE_HIGHLIGHT - Important caveat
8. CONCEPT - Additional details
9. PRACTICE - Interactive task
10. SUMMARY - Key takeaways

STYLING OPTIONS BY CARD TYPE:

NOTE:
- background: bg-blue-50
- border: border-blue-200
- icon: 📘

CONCEPT:
- icon: 💡
- (usually white background)

ANALOGY:
- background: bg-orange-50
- border: border-orange-200
- icon: 🎯

DEFINITION:
- background: bg-red-50
- border: border-red-300
- icon: 📖

EXAMPLE:
- background: bg-blue-100
- border: border-blue-200
- icon: ℹ️

NOTE_HIGHLIGHT:
- background: bg-green-50
- border: border-green-200
- icon: ✏️

PRACTICE:
- icon: 🎯

SUMMARY:
- icon: ✨
*/

-- ============================================
-- TIPS FOR CONTENT CREATION
-- ============================================

/*
DIFFICULTY LEVELS:
- Level 1 (13-14 years): Very simple language, lots of analogies
- Level 2 (15-16 years): Moderate complexity, basic formulas
- Level 3 (17-18 years): Technical depth, multiple formulas

INDIAN CONTEXT:
- Always use ₹ (not $)
- Reference NSE/BSE (not NYSE)
- Use Indian companies: TCS, Reliance, HDFC Bank, Infosys, ITC
- Analogies: chai, cricket, Bollywood, Indian festivals

CONTENT LENGTH:
- Card content: 150-300 words
- Keep paragraphs short (2-4 sentences)
- Use bullet points for lists
- Bold key terms

QUIZ QUESTIONS:
- Make them test understanding, not just memory
- Provide detailed explanations
- Use numerical examples where possible
- Difficulty should match lesson difficulty_level
*/

-- ============================================
-- END OF TEMPLATE
-- ============================================

