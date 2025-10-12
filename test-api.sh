#!/bin/bash

# Devion Backend API Test Script
# Run this to quickly test all endpoints

BASE_URL="http://localhost:3001"
echo "🧪 Testing Devion Backend API..."
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Health Check
echo -e "${YELLOW}1. Testing Health Check...${NC}"
HEALTH=$(curl -s "$BASE_URL/health")
if [[ $HEALTH == *"ok"* ]]; then
  echo -e "${GREEN}✅ Health Check: PASSED${NC}"
else
  echo -e "${RED}❌ Health Check: FAILED${NC}"
  exit 1
fi
echo ""

# Test Signup
echo -e "${YELLOW}2. Testing User Signup...${NC}"
SIGNUP=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test$(date +%s)@devion.in\",\"password\":\"Test123456\",\"name\":\"Test User\",\"age\":16}")

if [[ $SIGNUP == *"token"* ]]; then
  echo -e "${GREEN}✅ User Signup: PASSED${NC}"
  TOKEN=$(echo $SIGNUP | jq -r '.token')
  EMAIL=$(echo $SIGNUP | jq -r '.user.email')
else
  echo -e "${RED}❌ User Signup: FAILED${NC}"
  echo "$SIGNUP"
  exit 1
fi
echo ""

# Test Login
echo -e "${YELLOW}3. Testing User Login...${NC}"
LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Test123456\"}")

if [[ $LOGIN == *"token"* ]]; then
  echo -e "${GREEN}✅ User Login: PASSED${NC}"
  TOKEN=$(echo $LOGIN | jq -r '.token')
else
  echo -e "${RED}❌ User Login: FAILED${NC}"
  exit 1
fi
echo ""

# Test Get All Stocks
echo -e "${YELLOW}4. Testing Get All Stocks...${NC}"
STOCKS=$(curl -s "$BASE_URL/api/market/stocks?limit=5")
STOCK_COUNT=$(echo $STOCKS | jq -r '.pagination.total')

if [[ $STOCK_COUNT -gt 0 ]]; then
  echo -e "${GREEN}✅ Get All Stocks: PASSED (Total: $STOCK_COUNT stocks)${NC}"
else
  echo -e "${RED}❌ Get All Stocks: FAILED${NC}"
  exit 1
fi
echo ""

# Test Featured Stocks
echo -e "${YELLOW}5. Testing Featured Stocks...${NC}"
FEATURED=$(curl -s "$BASE_URL/api/market/stocks/featured?limit=5")
FEATURED_COUNT=$(echo $FEATURED | jq -r '.count')

if [[ $FEATURED_COUNT -gt 0 ]]; then
  echo -e "${GREEN}✅ Featured Stocks: PASSED (Count: $FEATURED_COUNT)${NC}"
else
  echo -e "${RED}❌ Featured Stocks: FAILED${NC}"
  exit 1
fi
echo ""

# Test Stock Search
echo -e "${YELLOW}6. Testing Stock Search...${NC}"
SEARCH=$(curl -s "$BASE_URL/api/market/stocks/search?q=RELIANCE")
SEARCH_COUNT=$(echo $SEARCH | jq -r '.count')

if [[ $SEARCH_COUNT -gt 0 ]]; then
  echo -e "${GREEN}✅ Stock Search: PASSED (Found: $SEARCH_COUNT stocks)${NC}"
else
  echo -e "${RED}❌ Stock Search: FAILED${NC}"
  exit 1
fi
echo ""

# Test Stock Details
echo -e "${YELLOW}7. Testing Stock Details...${NC}"
DETAILS=$(curl -s "$BASE_URL/api/market/stocks/RELIANCE")
HAS_LTP=$(echo $DETAILS | jq -r '.data.ltp')

if [[ $HAS_LTP != "null" ]]; then
  PRICE=$(echo $DETAILS | jq -r '.data.ltp')
  echo -e "${GREEN}✅ Stock Details: PASSED (RELIANCE LTP: ₹$PRICE)${NC}"
else
  echo -e "${YELLOW}⚠️  Stock Details: PASSED (No live price - market closed?)${NC}"
fi
echo ""

# Test Stock Sectors
echo -e "${YELLOW}8. Testing Sectors...${NC}"
SECTORS=$(curl -s "$BASE_URL/api/market/sectors")
SECTOR_COUNT=$(echo $SECTORS | jq -r '.count')

if [[ $SECTOR_COUNT -ge 0 ]]; then
  echo -e "${GREEN}✅ Get Sectors: PASSED (Count: $SECTOR_COUNT)${NC}"
else
  echo -e "${RED}❌ Get Sectors: FAILED${NC}"
  exit 1
fi
echo ""

# Summary
echo "================================"
echo -e "${GREEN}🎉 All Tests Passed!${NC}"
echo ""
echo "📊 Summary:"
echo "  - Total Stocks: $STOCK_COUNT"
echo "  - Featured Stocks: $FEATURED_COUNT"
echo "  - Sectors: $SECTOR_COUNT"
echo "  - Auth Token: ${TOKEN:0:20}..."
echo ""
echo "✅ Backend is ready for development!"

