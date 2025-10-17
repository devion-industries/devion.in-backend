-- RESET YOUR PORTFOLIO TO ₹100,000
-- ⚠️ WARNING: This will delete all your trades and holdings!
-- Only run this if you want to start completely fresh

-- Step 1: Delete all holdings
DELETE FROM holdings WHERE portfolio_id IN (SELECT id FROM portfolios WHERE user_id = 'YOUR_USER_ID_HERE');

-- Step 2: Delete all trades
DELETE FROM trades WHERE user_id = 'YOUR_USER_ID_HERE';

-- Step 3: Reset portfolio cash to ₹100,000
UPDATE portfolios 
SET 
  current_cash = 100000,
  total_value = 100000,
  budget_amount = 100000,
  updated_at = NOW()
WHERE user_id = 'YOUR_USER_ID_HERE';

-- Step 4: Verify the reset
SELECT 
  budget_amount as "Starting Budget",
  current_cash as "Current Cash",
  total_value as "Total Value"
FROM portfolios
WHERE user_id = 'YOUR_USER_ID_HERE';

