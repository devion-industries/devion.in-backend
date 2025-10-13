#!/bin/bash

BASE_URL="http://localhost:3001"
echo "🎯 Complete Portfolio API Test"
echo "==============================="
echo ""

# Create user
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test$(date +%s)@devion.in\",\"password\":\"Test123\",\"name\":\"Test\",\"age\":16}" | jq -r '.token')

echo "✅ User created and logged in"
echo ""

# Test 1: Buy affordable stock
echo "1️⃣  Buying 100 shares of YESBANK..."
BUY1=$(curl -s -X POST "$BASE_URL/api/portfolio/buy" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"YESBANK","quantity":100}')
echo "$BUY1" | jq '{message, price: .trade.price, cost: .trade.total_cost, cash_left: .portfolio.current_cash}'
echo ""

# Test 2: Get holdings
echo "2️⃣  Getting holdings..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/portfolio/holdings" | jq '{holdings: .holdings[0] | {symbol, quantity, avg_price: .avg_buy_price, current_price, gain_loss}, total_invested, current_value}'
echo ""

# Test 3: Sell some shares
echo "3️⃣  Selling 50 shares of YESBANK..."
SELL=$(curl -s -X POST "$BASE_URL/api/portfolio/sell" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"YESBANK","quantity":50}')
echo "$SELL" | jq '{message, price: .trade.price, profit_loss: .trade.profit_loss, cash_received: .portfolio.cash_received}'
echo ""

# Test 4: Get performance
echo "4️⃣  Getting portfolio performance..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/portfolio/performance" | jq '{portfolio_value, total_gain_loss, total_gain_loss_percent, number_of_trades, number_of_holdings}'
echo ""

# Test 5: Get full portfolio
echo "5️⃣  Getting full portfolio summary..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/portfolio" | jq '{cash: .portfolio.current_cash, total_value: .portfolio.total_value, holdings_count: .portfolio.holdings_count, total_gain_loss: .portfolio.total_gain_loss, holdings: [.holdings[] | {symbol, quantity}]}'
echo ""

echo "==============================="
echo "✅ All Tests Complete!"
