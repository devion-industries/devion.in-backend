# 🎯 Devion Backend - AI-Powered Financial Literacy Platform

> RESTful API for India's first AI-powered financial literacy platform

[![Backend Deploy](https://img.shields.io/badge/Backend-Railway-blueviolet)](https://devion-backend-prod-floral-sun-907-production.up.railway.app)
[![Database](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)

**Latest Update:** Stock data populated with 1,999 NSE stocks

## 📋 Overview

Devion Backend is a comprehensive API platform that powers financial literacy education for teenagers through:
- **User Authentication** - JWT-based secure auth system
- **Paper Trading** - Risk-free portfolio simulation
- **Real Market Data** - Live NSE stock prices (1,999 stocks)
- **AI Tutor** - GPT-5 powered conversational learning
- **Voice AI** - ElevenLabs powered natural voice interactions
- **Gamification** - Badges, leaderboards, and progress tracking

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x
- **Supabase** account & project
- **OpenAI** API key
- **ElevenLabs** API key

### Installation

```bash
# Clone repository
git clone https://github.com/devion-industries/devion.in-backend.git
cd devion.in-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your API keys

# Build TypeScript
npm run build

# Start development server
npm run dev
```

Server runs on **http://localhost:3001**

### Import Stock Data

```bash
# Import 1,999 NSE equity stocks
npm run build
node dist/scripts/import-nse-stocks.js
```

## 📦 Tech Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **AI Integration**: OpenAI GPT-5
- **Voice AI**: ElevenLabs
- **Market Data**: Yahoo Finance (yahoo-finance2)
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Zod
- **File Parsing**: csv-parse

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts & profiles
- `portfolios` - User portfolios with flexible budget
- `holdings` - Current stock holdings
- `trades` - Complete trade history (buy/sell)
- `stocks` - NSE stock master data (1,999 stocks)
- `stock_prices` - Historical price data cache

### Learning System
- `lessons` - Educational content modules
- `user_progress` - Lesson completion tracking
- `quizzes` - Quiz questions & answers
- `quiz_attempts` - User quiz submissions & scores

### Gamification
- `badges` - Achievement badge definitions
- `user_badges` - User badge collection
- `cohorts` - Teacher-led class management

### AI & Voice
- `voice_sessions` - Voice interaction sessions
- `voice_interactions` - Individual voice Q&A exchanges
- `user_voice_preferences` - Voice settings per user

### Monetization
- `subscription_plans` - Free/Pro/Ultra tiers
- `user_subscriptions` - User plan assignments
- `payments` - Payment transaction history

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/signup          Register new user
POST   /api/auth/login           User login
GET    /api/auth/profile         Get user profile
PUT    /api/auth/profile         Update user profile
```

### Market Data
```
GET    /api/market/featured      Get top 500 featured stocks
GET    /api/market/search        Search stocks by symbol/name
GET    /api/market/stock/:symbol Get stock details & price
GET    /api/market/history/:symbol Historical price data
POST   /api/market/sync          Sync stocks from Yahoo Finance
```

### Portfolio Management
```
GET    /api/portfolio            Get user portfolio summary
GET    /api/portfolio/holdings   Get all holdings
GET    /api/portfolio/trades     Get trade history
POST   /api/portfolio/buy        Execute buy order
POST   /api/portfolio/sell       Execute sell order
PUT    /api/portfolio/budget     Update portfolio budget
GET    /api/portfolio/budget/history Budget change history
```

### AI Tutor
```
POST   /api/ai/ask               Ask AI a financial question
GET    /api/ai/portfolio-insights Get AI-powered portfolio analysis
POST   /api/ai/explain           Explain financial concept
GET    /api/ai/learning-path     Get personalized learning path
GET    /api/ai/health            Check AI service health
```

### Voice AI
```
POST   /api/voice/ask            Ask question with voice response
POST   /api/voice/explain        Explain concept with voice
GET    /api/voice/portfolio-insights Narrated portfolio insights
POST   /api/voice/tts            Text-to-speech conversion
POST   /api/voice/session/start  Start voice session
POST   /api/voice/session/end    End voice session
GET    /api/voice/voices         List available voices
GET    /api/voice/usage          Get usage statistics
GET    /api/voice/health         Check voice service health
```

### Lessons & Quizzes (Placeholder)
```
GET    /api/lessons              List all lessons
GET    /api/lessons/:id          Get lesson details
POST   /api/lessons/progress     Mark lesson complete

GET    /api/quiz                 List quizzes
POST   /api/quiz/submit          Submit quiz answers
```

### Badges & Subscriptions (Placeholder)
```
GET    /api/badges               List badges
GET    /api/badges/user          Get user badges

GET    /api/subscription/plans   List subscription plans
POST   /api/subscription/subscribe Subscribe to plan
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# OpenAI API (AI Tutor - GPT-5)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ElevenLabs API (Voice AI)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

## 📊 Stock Data

The platform includes **1,999 NSE equity stocks** from the National Stock Exchange of India:

### Stock Import
- Source: `NSE Stocks Equity.csv` (official NSE data)
- Total: 1,999 equity stocks (SERIES = 'EQ')
- Featured: Top 500 stocks by market cap
- Update: Real-time prices via Yahoo Finance

### Sample Stocks
- RELIANCE, TCS, INFY, HDFC, ICICI, SBI
- ADANIPORTS, ADANIENT, ADANIPOWER
- BAJAJ-AUTO, BAJAJFINSV, BAJFINANCE
- And 1,990+ more!

## 🧪 Testing

### Manual API Testing

```bash
# Test all endpoints
./test-api.sh

# Test portfolio features
./test-portfolio-complete.sh

# Test flexible budget system
./test-flexible-budget.sh
```

### Test Endpoints Manually

```bash
# Health check
curl http://localhost:3001/health

# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test User"}'

# Get featured stocks
curl http://localhost:3001/api/market/featured
```

## 🚢 Deployment

### Railway (Production)

```bash
# Push to GitHub main branch
git add -A
git commit -m "Update: Description"
git push origin main

# Railway auto-deploys from GitHub
```

**Production URL**: https://devion-backend-prod-floral-sun-907-production.up.railway.app

### Environment Variables on Railway

Set these in Railway dashboard or CLI:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `PORT` (usually auto-set)
- `NODE_ENV=production`

### Docker Deployment (Alternative)

```bash
# Build Docker image
docker build -t devion-backend .

# Run container
docker run -p 3001:3001 --env-file .env devion-backend
```

## 📂 Project Structure

```
devion.in-backend/
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment config
│   │   └── database.ts         # Supabase client & helpers
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication
│   │   ├── errorHandler.ts    # Global error handling
│   │   └── logger.ts           # Request logging
│   ├── controllers/
│   │   ├── auth.controller.ts  # Auth logic
│   │   ├── market.controller.ts # Market data logic
│   │   ├── portfolio.controller.ts # Portfolio logic
│   │   ├── ai.controller.ts    # AI tutor logic
│   │   └── voice.controller.ts # Voice AI logic
│   ├── routes/
│   │   ├── auth.routes.ts      # Auth endpoints
│   │   ├── market.routes.ts    # Market endpoints
│   │   ├── portfolio.routes.ts # Portfolio endpoints
│   │   ├── ai.routes.ts        # AI endpoints
│   │   └── voice.routes.ts     # Voice endpoints
│   ├── services/
│   │   ├── yahoo.service.ts    # Yahoo Finance integration
│   │   ├── ai.service.ts       # OpenAI integration
│   │   └── voice.service.ts    # ElevenLabs integration
│   ├── scripts/
│   │   └── import-nse-stocks.ts # NSE stock import script
│   ├── utils/
│   │   └── logger.ts           # Winston logger config
│   └── index.ts                # Express server entry
├── dist/                       # Compiled JavaScript
├── logs/                       # Application logs
├── Dockerfile                  # Docker config
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── .env                        # Environment variables (gitignored)
└── README.md                   # This file
```

## ✨ Features

### ✅ Implemented
- ✅ User authentication (signup/login/JWT)
- ✅ Flexible budget portfolio system
- ✅ Buy/sell stock execution
- ✅ Real-time market data (Yahoo Finance)
- ✅ 1,999 NSE stocks imported
- ✅ AI tutor (GPT-5 Q&A)
- ✅ Voice AI (ElevenLabs TTS)
- ✅ Trade history & P&L tracking
- ✅ Stock search & filtering
- ✅ Budget management & history

### 🚧 In Progress
- 🚧 Lessons & quiz system
- 🚧 Badge & achievement system
- 🚧 Leaderboard rankings
- 🚧 Cohort management (for teachers)

### 📝 Planned
- 📝 Subscription tier enforcement
- 📝 Payment gateway (Razorpay)
- 📝 Email notifications
- 📝 Admin dashboard
- 📝 Advanced analytics

## 📱 Platform Status

| Component | Status | Details |
|-----------|--------|---------|
| **API Server** | ✅ Live | Railway (Auto-deploy from GitHub) |
| **Database** | ✅ Live | Supabase PostgreSQL (Mumbai) |
| **Stock Data** | ✅ Synced | 1,999 NSE stocks |
| **AI Tutor** | ✅ Active | OpenAI GPT-5 |
| **Voice AI** | ✅ Active | ElevenLabs |
| **Market Data** | ✅ Active | Yahoo Finance |

## 📚 Additional Documentation

- `AI_SYSTEM_COMPLETE.md` - AI tutor implementation guide
- `VOICE_AI_COMPLETE.md` - Voice AI integration details
- `PORTFOLIO_API_SUCCESS.md` - Portfolio API documentation
- `FLEXIBLE_BUDGET_SYSTEM.md` - Budget system design
- `NSE_IMPORT_SUCCESS.md` - Stock data import guide
- `YAHOO_FINANCE_MIGRATION.md` - Yahoo Finance integration
- `DEPLOY_FLYIO.md` - Fly.io deployment (legacy)

## 🤝 Contributing

This is a **proprietary project** by Devion Industries.

## 📄 License

**Proprietary** - All rights reserved by Devion Industries

## 👥 Team

**Devion Industries**  
Building the future of financial literacy in India 🇮🇳

---

**API Base URL**: https://devion-backend-prod-floral-sun-907-production.up.railway.app/api

**Made with ❤️ in India** | **Demo Live at Global Fintech Fest** 🚀
