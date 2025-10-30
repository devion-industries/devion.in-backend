-- Check user's portfolio data
-- Run this query in your Supabase SQL editor to see your account details

-- 1. Check portfolio balance
SELECT 
  user_id,
  budget_amount as "Starting Budget",
  current_cash as "Current Cash",
  total_value as "Total Portfolio Value",
  created_at as "Account Created",
  budget_set_at as "Budget Set Date"
FROM portfolios
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check all trades
SELECT 
  symbol,
  type as "Trade Type",
  quantity,
  price,
  total_cost as "Total Amount",
  executed_at as "Date"
FROM trades
ORDER BY executed_at DESC
LIMIT 20;

-- 3. Check holdings
SELECT 
  symbol,
  quantity as "Shares Owned",
  avg_buy_price as "Avg Buy Price",
  current_value as "Current Value"
FROM holdings
WHERE quantity > 0
ORDER BY symbol;

-- 4. Calculate account summary
SELECT 
  p.user_id,
  p.budget_amount as "Starting Budget",
  p.current_cash as "Cash Balance",
  COALESCE(SUM(h.current_value), 0) as "Stocks Value",
  p.current_cash + COALESCE(SUM(h.current_value), 0) as "Total Portfolio Value"
FROM portfolios p
LEFT JOIN holdings h ON p.user_id = h.portfolio_id
GROUP BY p.user_id, p.budget_amount, p.current_cash;



