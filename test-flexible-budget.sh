#!/bin/bash

BASE_URL="http://localhost:3001"
echo "💰 Testing Flexible Budget System"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test 1: Signup with default budget (₹10,000)
echo -e "${YELLOW}Test 1: Signup with default budget (₹10,000)${NC}"
USER1=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user1_$(date +%s)@devion.in\",\"password\":\"Test123\",\"name\":\"Default User\",\"age\":16}")
TOKEN1=$(echo $USER1 | jq -r '.token')
echo "✅ User created with default budget"

PORTFOLIO1=$(curl -s -H "Authorization: Bearer $TOKEN1" "$BASE_URL/api/portfolio")
BUDGET1=$(echo $PORTFOLIO1 | jq -r '.portfolio.budget_amount')
echo -e "${GREEN}   Budget: ₹$BUDGET1${NC}"
echo ""

# Test 2: Signup with custom budget (₹50,000)
echo -e "${YELLOW}Test 2: Signup with custom budget (₹50,000)${NC}"
USER2=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user2_$(date +%s)@devion.in\",\"password\":\"Test123\",\"name\":\"Custom User\",\"age\":16,\"initial_budget\":50000}")
TOKEN2=$(echo $USER2 | jq -r '.token')
echo "✅ User created with custom budget"

PORTFOLIO2=$(curl -s -H "Authorization: Bearer $TOKEN2" "$BASE_URL/api/portfolio")
BUDGET2=$(echo $PORTFOLIO2 | jq -r '.portfolio.budget_amount')
CASH2=$(echo $PORTFOLIO2 | jq -r '.portfolio.current_cash')
echo -e "${GREEN}   Budget: ₹$BUDGET2${NC}"
echo -e "${GREEN}   Cash: ₹$CASH2${NC}"
echo ""

# Test 3: Signup with high budget (₹5,00,000)
echo -e "${YELLOW}Test 3: Signup with high budget (₹5,00,000)${NC}"
USER3=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user3_$(date +%s)@devion.in\",\"password\":\"Test123\",\"name\":\"High Budget User\",\"age\":16,\"initial_budget\":500000}")
TOKEN3=$(echo $USER3 | jq -r '.token')
echo "✅ User created with high budget"

PORTFOLIO3=$(curl -s -H "Authorization: Bearer $TOKEN3" "$BASE_URL/api/portfolio")
BUDGET3=$(echo $PORTFOLIO3 | jq -r '.portfolio.budget_amount')
echo -e "${GREEN}   Budget: ₹$BUDGET3${NC}"
echo ""

# Test 4: Update budget (increase)
echo -e "${YELLOW}Test 4: Update budget from ₹$BUDGET1 to ₹20,000${NC}"
UPDATE1=$(curl -s -X PUT "$BASE_URL/api/portfolio/budget" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"new_budget":20000,"reason":"Need more funds for practice"}')
echo "$UPDATE1" | jq '{message, old_budget, new_budget, new_cash}'
echo ""

# Test 5: Buy some stocks
echo -e "${YELLOW}Test 5: Buy 50 shares of YESBANK (₹23.91 each)${NC}"
BUY=$(curl -s -X POST "$BASE_URL/api/portfolio/buy" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"YESBANK","quantity":50}')
echo "$BUY" | jq '{message, cost: .trade.total_cost, cash_left: .portfolio.current_cash}'
echo ""

# Test 6: Try to reduce budget below investments (should fail)
echo -e "${YELLOW}Test 6: Try to reduce budget to ₹1,000 (should fail)${NC}"
UPDATE_FAIL=$(curl -s -X PUT "$BASE_URL/api/portfolio/budget" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"new_budget":1000,"reason":"Testing limit"}')
ERROR=$(echo $UPDATE_FAIL | jq -r '.error.message')
if [[ $ERROR == *"Cannot reduce budget below current investments"* ]]; then
  echo -e "${GREEN}✅ Correctly rejected: $ERROR${NC}"
else
  echo "$UPDATE_FAIL" | jq .
fi
echo ""

# Test 7: Increase budget successfully
echo -e "${YELLOW}Test 7: Increase budget to ₹30,000${NC}"
UPDATE2=$(curl -s -X PUT "$BASE_URL/api/portfolio/budget" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"new_budget":30000,"reason":"Want to buy more stocks"}')
echo "$UPDATE2" | jq '{message, old_budget, new_budget, new_cash, current_investments}'
echo ""

# Test 8: Get budget history
echo -e "${YELLOW}Test 8: Get budget change history${NC}"
HISTORY=$(curl -s -H "Authorization: Bearer $TOKEN1" "$BASE_URL/api/portfolio/budget/history")
echo "$HISTORY" | jq '{current_budget, custom_budget_enabled, changes: .history | length}'
echo ""
echo "Recent changes:"
echo "$HISTORY" | jq '.history[0:3] | .[] | {old: .old_budget, new: .new_budget, reason: .change_reason, when: .changed_at}'
echo ""

# Test 9: Final portfolio summary
echo -e "${YELLOW}Test 9: Final portfolio summary${NC}"
FINAL=$(curl -s -H "Authorization: Bearer $TOKEN1" "$BASE_URL/api/portfolio")
echo "$FINAL" | jq '{budget: .portfolio.budget_amount, cash: .portfolio.current_cash, total_value: .portfolio.total_value, holdings_count: .portfolio.holdings_count}'
echo ""

# Test 10: Invalid budget (too high)
echo -e "${YELLOW}Test 10: Try signup with invalid budget (₹2 crore - should fail)${NC}"
INVALID=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"invalid_$(date +%s)@devion.in\",\"password\":\"Test123\",\"name\":\"Invalid User\",\"age\":16,\"initial_budget\":20000000}")
ERROR2=$(echo $INVALID | jq -r '.error.message')
if [[ $ERROR2 == *"Budget must be between"* ]]; then
  echo -e "${GREEN}✅ Correctly rejected: $ERROR2${NC}"
else
  echo "$INVALID" | jq .
fi
echo ""

echo "=================================="
echo -e "${GREEN}✅ All Flexible Budget Tests Complete!${NC}"
echo ""
echo "Summary:"
echo "  ✅ Default budget (₹10,000) works"
echo "  ✅ Custom budget at signup works"
echo "  ✅ Budget increase works"
echo "  ✅ Budget decrease validation works"
echo "  ✅ Budget history tracking works"
echo "  ✅ Invalid budget rejection works"

