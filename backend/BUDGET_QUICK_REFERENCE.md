# 💰 Flexible Budget System - Quick Reference

## 🎯 Three Budget Models

### 1. **Individual User Budget**
```typescript
// Default: ₹10,000
// Range: ₹1,000 - ₹1,00,00,000
// User controlled: YES
```

### 2. **Cohort Budget (Teacher-Set)**
```typescript
// Set by: Teacher
// Applies to: All students in cohort
// Student can modify: NO
```

### 3. **Parent-Controlled Budget** *(Future)*
```typescript
// Set by: Parent
// Child can modify: NO
// Parent can adjust: YES
```

---

## 🚀 Quick Examples

### Signup with Default Budget
```bash
POST /api/auth/signup
{
  "email": "student@example.com",
  "password": "secure123",
  "name": "John Doe",
  "age": 16
  # Budget will be ₹10,000
}
```

### Signup with Custom Budget
```bash
POST /api/auth/signup
{
  "email": "student@example.com",
  "password": "secure123",
  "name": "John Doe",
  "age": 16,
  "initial_budget": 50000  # ₹50,000
}
```

### Update Budget
```bash
PUT /api/portfolio/budget
Authorization: Bearer {token}
{
  "new_budget": 30000,
  "reason": "Want to buy more stocks"
}
```

### View Budget History
```bash
GET /api/portfolio/budget/history
Authorization: Bearer {token}
```

---

## ✅ Validations

| Rule | Value |
|------|-------|
| **Min Budget** | ₹1,000 |
| **Max Budget** | ₹1,00,00,000 |
| **Cannot reduce below** | Current investments |
| **Cohort students** | Cannot modify budget |

---

## 📊 How It Works

```
User starts with:
  Budget: ₹20,000
  Cash: ₹20,000
  Investment: ₹0

↓ Buys stocks worth ₹5,000

  Budget: ₹20,000
  Cash: ₹15,000
  Investment: ₹5,000

↓ Wants to increase to ₹50,000

  Budget: ₹50,000
  Cash: ₹45,000  (50K - 5K investment)
  Investment: ₹5,000

✅ Investment preserved!

↓ Tries to reduce to ₹3,000

  Budget: ₹3,000
  Cash: -₹2,000  (3K - 5K investment)
  Investment: ₹5,000

❌ REJECTED! Cannot go negative
```

---

## 🎓 Use Cases

| Scenario | Budget | Type |
|----------|--------|------|
| Beginner student | ₹10,000 | Default |
| Advanced learner | ₹5,00,000 | Custom |
| Parent-supervised | ₹20,000 | Custom |
| School competition | ₹50,000 | Cohort-fixed |

---

## 🔧 Files Modified

- ✅ `src/controllers/auth.controller.ts` - Added `initial_budget` param
- ✅ `src/controllers/portfolio.controller.ts` - Added `updateBudget()` & `getBudgetHistory()`
- ✅ `src/routes/portfolio.routes.ts` - Added budget routes
- ✅ Database - Added `budget_change_history` table
- ✅ Database - Enhanced `portfolios` & `cohorts` tables

---

**Status:** ✅ COMPLETE & TESTED  
**Tests:** 10/10 Passing

