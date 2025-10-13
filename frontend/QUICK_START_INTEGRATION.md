# 🚀 Quick Start - Frontend Integration

## ⚡ Get Started in 3 Steps

### Step 1: Start Backend
```bash
cd Backend/devion-backend
npm run dev
# ✅ Server running on http://localhost:3001
```

### Step 2: Start Frontend
```bash
cd Frontend/learn-trade-coach
npm run dev
# ✅ App running on http://localhost:8086
```

### Step 3: Test Integration
Visit: `http://localhost:8086` and use the `ApiTestComponent` to verify connectivity.

---

## 📝 Usage Examples

### In Any Component:

```typescript
// Authentication
import { useAuth } from '@/hooks/useAuth';
const { user, login, signup, logout, isAuthenticated } = useAuth();

// Portfolio
import { usePortfolio } from '@/hooks/usePortfolio';
const { portfolio, holdings, buyStock, sellStock, updateBudget } = usePortfolio();

// Market Data
import { useMarket } from '@/hooks/useMarket';
const { featuredStocks, sectors } = useMarket();
```

---

## 🔧 Configuration

### Environment (.env.local)
```bash
VITE_API_URL=http://localhost:3001
```

---

## 📊 What's Integrated

| Feature | Status | Endpoints |
|---------|--------|-----------|
| **Authentication** | ✅ | Signup, Login, Profile |
| **Portfolio** | ✅ | Get, Buy, Sell, Budget |
| **Market Data** | ✅ | Stocks, Search, Details |
| **Type Safety** | ✅ | 100% TypeScript |
| **Error Handling** | ✅ | Toast + Retry |
| **Auto-Refetch** | ✅ | Real-time updates |

---

## 🧪 Test Component

Add to any page to test APIs:

```typescript
import ApiTestComponent from '@/components/ApiTestComponent';

<ApiTestComponent />
```

---

## 🎉 You're Ready!

Replace mock data in your components with real hooks:

```typescript
// Before (Mock Data)
const portfolio = { value: 10000, cash: 5000 };

// After (Real Data)
const { portfolio } = usePortfolio();
```

**All APIs are connected and ready to use!** 🚀

