# Devion Backend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Get Supabase Keys (Required)

1. Go to: https://supabase.com/dashboard/project/sfwyohnlcsqomkosvweb/settings/api
2. Copy these values:
   - **URL**: `https://sfwyohnlcsqomkosvweb.supabase.co`
   - **anon/public key**: Long string starting with `eyJhbG...`
   - **service_role key**: Different long string

### Step 2: Update .env File

```bash
cd /Users/shauryasingh/Documents/AI\ mock\ trader/Backend/devion-backend
nano .env
```

Update these three lines:
```bash
SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_SERVICE_KEY=paste_your_service_role_key_here
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 3: Start the Server

```bash
npm run dev
```

✅ You should see:
```
🚀 Devion Backend Server started on port 3001
📊 Environment: development
🔒 CORS enabled for: http://localhost:8086
```

### Step 4: Test It!

#### Create a user:
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@devion.in",
    "password": "Demo123!",
    "name": "Demo User",
    "age": 17,
    "school": "Demo School"
  }'
```

✅ You should get back a JWT token and user info

#### Search for stocks:
```bash
curl "http://localhost:3001/api/market/stocks/search?q=reliance"
```

✅ You should see stock results (using mock data if no Kite keys)

## 🎯 What Works Now

- ✅ User signup/login
- ✅ JWT authentication  
- ✅ Stock search
- ✅ Stock details
- ✅ Historical data
- ✅ All database tables ready

## 🔜 Coming Next

The remaining APIs will be implemented next:
- Portfolio management (buy/sell)
- Lessons & quizzes
- AI voice tutor
- Subscriptions & payments

## 🐛 Troubleshooting

**Server won't start?**
- Check you updated SUPABASE_ANON_KEY in .env
- Check you're in the right directory
- Try: `npm install` again

**Authentication errors?**
- Verify your Supabase keys are correct
- Check the keys have no extra spaces
- Make sure you copied the full key

**Stock data not loading?**
- It's OK! The system uses mock data by default
- Add Kite Connect keys later for real data

## 📖 Full Documentation

See `README.md` for complete documentation.

