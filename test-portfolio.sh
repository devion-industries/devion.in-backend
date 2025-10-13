#!/bin/bash

# Devion Portfolio API Test Script

BASE_URL="http://localhost:3001"
echo "🧪 Testing Devion Portfolio API..."
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create a test user and login
echo -e "${YELLOW}1. Creating test user and logging in...${NC}"
SIGNUP=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"portfolio$(date +%s)@devion.in\",\"password\":\"Test123456\",\"name\":\"Portfolio Test\",\"age\":16}")

if [[ $SIGNUP == *"token"* ]]; then
  echo -e "${GREEN}✅ User created${NC}"
  TOKEN=$(echo $SIGNUP | jq -r '.token')
  USER_EMAIL=$(echo $SIGNUP | jq -r '.user.email')
  echo "   Email: $USER_EMAIL"
else
  echo -e "${RED}❌ Failed to create user${NC}"
  echo "$SIGNUP"
  exit 1
fi
echo ""

# Test 1: Get Portfolio
echo -e "${YELLOW}2. Getting initial portfolio...${NC}"
PORTFOLIO=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/portfolio")
CURRENT_CASH=$(echo $PORTFOLIO | jq -r '.portfolio.current_cash')
BUDGET=$(echo $PORTFOLIO | jq -r '.portfolio.budget_amount')

if [[ $CURRENT_CASH ]]; then
  echo -e "${GREEN}✅ Portfolio retrieved${NC}"
  echo "   Budget: ₹$BUDGET"
  echo "   Cash: ₹$CURRENT_CASH"
else
  echo -e "${RED}❌ Failed to get portfolio${NC}"
  echo "$PORTFOLIO"
fi
echo ""

# Test 2: Buy Stock
echo -e "${YELLOW}3. Buying 10 shares of RELIANCE...${NC}"
BUY=$(curl -s -X POST "$BASE_URL/api/portfolio/buy" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"RELIANCE","quantity":10}')

if [[ $BUY == *"Stock purchased successfully"* ]]; then
  echo -e "${GREEN}✅ Stock purchased${NC}"
  PRICE=$(echo $BUY | jq -r '.trade.price')
  TOTAL=$(echo $BUY | jq -r '.trade.total_cost')
  echo "   Stock: RELIANCE"
  echo "   Quantity: 10"
  echo "   Price: ₹$PRICE"
  echo "   Total Cost: ₹$TOTAL"
else
  echo -e "${RED}❌ Failed to buy stock${NC}"
  echo "$BUY"
fi
echo ""

# Test 3: Get Holdings
echo -e "${YELLOW}4. Getting holdings...${NC}"
HOLDINGS=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/portfolio/holdings")
HOLDINGS_COUNT=$(echo $HOLDINGS | jq -r '.holdings | length')

if [[ $HOLDINGS_COUNT -gt 0 ]]; then
  echo -e "${GREEN}✅ Holdings retrieved${NC}"
  echo "   Number of holdings: $HOLDINGS_COUNT"
  echo "$HOLDINGS" | jq '.holdings[] | {symbol: .stock_symbol, quantity: .quantity, avg_price: .average_price, current_price: .current_price, gain_loss: .gain_loss}'
else
  echo -e "${YELLOW}⚠️  No holdings found${NC}"
fi
echo ""

# Test 4: Get Trade History
echo -e "${YELLOW}5. Getting trade history...${NC}"
TRADES=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/portfolio/trades")
TRADES_COUNT=$(echo $TRADES | jq -r '.trades | length')

if [[ $TRADES_COUNT -gt 0 ]]; then
  echo -e "${GREEN}✅ Trade history retrieved${NC}"
  echo "   Number of trades: $TRADES_COUNT"
  echo "$TRADES" | jq '.trades[0] | {type: .trade_type, symbol: .stock_symbol, quantity: .quantity, price: .price}'
else
  echo -e "${YELLOW}⚠️  No trades found${NC}"
fi
echo ""

# Test 5: Buy Another Stock
echo -e "${YELLOW}6. Buying 5 shares of TCS...${NC}"
BUY2=$(curl -s -X POST "$BASE_URL/api/portfolio/buy" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"TCS","quantity":5}')

if [[ $BUY2 == *"Stock purchased successfully"* ]]; then
  echo -e "${GREEN}✅ Stock purchased${NC}"
  PRICE2=$(echo $BUY2 | jq -r '.trade.price')
  TOTAL2=$(echo $BUY2 | jq -r '.trade.total_cost')
  echo "   Stock: TCS"
  echo "   Quantity: 5"
  echo "   Price: ₹$PRICE2"
  echo "   Total Cost: ₹$TOTAL2"
else
  echo -e "${YELLOW}⚠️  Buy failed (expected if insufficient funds)${NC}"
fi
echo ""

# Test 6: Sell Stock
echo -e "${YELLOW}7. Selling 5 shares of RELIANCE...${NC}"
SELL=$(curl -s -X POST "$BASE_URL/api/portfolio/sell" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"RELIANCE","quantity":5}')

if [[ $SELL == *"Stock sold successfully"* ]]; then
  echo -e "${GREEN}✅ Stock sold${NC}"
  SELL_PRICE=$(echo $SELL | jq -r '.trade.price')
  PROFIT=$(echo $SELL | jq -r '.trade.profit_loss')
  PROFIT_PCT=$(echo $SELL | jq -r '.trade.profit_loss_percent')
  echo "   Stock: RELIANCE"
  echo "   Quantity: 5"
  echo "   Price: ₹$SELL_PRICE"
  echo "   Profit/Loss: ₹$PROFIT ($PROFIT_PCT%)"
else
  echo -e "${RED}❌ Failed to sell stock${NC}"
  echo "$SELL"
fi
echo ""

# Test 7: Get Performance
echo -e "${YELLOW}8. Getting portfolio performance...${NC}"
PERF=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/portfolio/performance")

if [[ $PERF == *"portfolio_value"* ]]; then
  echo -e "${GREEN}✅ Performance retrieved${NC}"
  echo "$PERF" | jq '{portfolio_value: .portfolio_value, total_gain_loss: .total_gain_loss, total_gain_loss_percent: .total_gain_loss_percent, number_of_trades: .number_of_trades}'
else
  echo -e "${RED}❌ Failed to get performance${NC}"
  echo "$PERF"
fi
echo ""

# Test 8: Final Portfolio Summary
echo -e "${YELLOW}9. Final portfolio summary...${NC}"
FINAL=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/portfolio")
echo "$FINAL" | jq '{cash: .portfolio.current_cash, total_value: .portfolio.total_value, holdings_count: .portfolio.holdings_count, total_gain_loss: .portfolio.total_gain_loss}'
echo ""

echo "================================"
echo -e "${GREEN}🎉 All Portfolio Tests Complete!${NC}"
echo ""
echo "Test Summary:"
echo "  User: $USER_EMAIL"
echo "  Token: ${TOKEN:0:20}..."

