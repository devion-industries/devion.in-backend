# 🎯 Devion - AI-Powered Financial Literacy Platform

> Transforming teens into confident investors through AI-driven education

[![Backend Deploy](https://img.shields.io/badge/Backend-Railway-blueviolet)](https://devion-backend-prod-floral-sun-907-production.up.railway.app)
[![Frontend Deploy](https://img.shields.io/badge/Frontend-Vercel-black)](https://invested-demo-1jv8p5dg6-shauryaasingh1603-gmailcoms-projects.vercel.app)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

## 📋 Overview

Devion is India's first AI-powered financial literacy platform designed to teach teenagers how to invest through:
- **Interactive Lessons** - Gamified financial education content
- **Paper Trading** - Risk-free simulation with ₹10,000 virtual portfolio
- **AI Tutor** - GPT-5 powered personalized guidance
- **Voice Learning** - ElevenLabs powered natural voice interactions
- **Real Market Data** - Live NSE stock prices via Yahoo Finance

## 🏗️ Monorepo Structure

```
devion.in-backend/
├── backend/               # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/       # Environment & database config
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # External integrations (AI, Voice, Market)
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── scripts/      # Utility scripts (stock import, etc.)
│   │   └── index.ts      # Express server entry
│   ├── Dockerfile        # Docker container config
│   ├── package.json      # Backend dependencies
│   └── tsconfig.json     # TypeScript config
│
├── frontend/             # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # UI components (shadcn/ui)
│   │   ├── pages/        # Application pages
│   │   ├── lib/          # API client & utilities
│   │   ├── hooks/        # React Query hooks
│   │   └── App.tsx       # Main application
│   ├── package.json      # Frontend dependencies
│   ├── vite.config.ts    # Vite bundler config
│   └── tailwind.config.ts # Tailwind CSS config
│
├── README.md             # This file
└── .gitignore            # Git ignore rules
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x
- **Supabase** account (database)
- **OpenAI** API key (AI tutor)
- **ElevenLabs** API key (voice)

### 1️⃣ Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your API keys: SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY, ELEVENLABS_API_KEY

# Build TypeScript
npm run build

# Start development server
npm run dev
```

Backend runs on **http://localhost:3001**

### 2️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "VITE_API_URL=http://localhost:3001/api" > .env.local

# Start development server
npm run dev
```

Frontend runs on **http://localhost:8086**

### 3️⃣ Import Stock Data (Required)

```bash
cd backend

# Import NSE stocks into database
npm run build
node dist/scripts/import-nse-stocks.js
```

This imports **1,999 NSE equity stocks** into your Supabase database.

## 📦 Tech Stack

### Backend
- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (jsonwebtoken)
- **AI Integration**: OpenAI GPT-5
- **Voice AI**: ElevenLabs
- **Market Data**: Yahoo Finance (yahoo-finance2)
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Notifications**: Sonner (toast)

### Infrastructure
- **Backend Hosting**: Railway (Mumbai region via Supabase)
- **Frontend Hosting**: Vercel (Edge Network)
- **Database**: Supabase (PostgreSQL, Mumbai)
- **CI/CD**: GitHub Actions → Railway/Vercel
- **Containerization**: Docker

## 🔐 Environment Variables

### Backend (.env)
```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# OpenAI (AI Tutor)
OPENAI_API_KEY=sk-xxxxx

# ElevenLabs (Voice AI)
ELEVENLABS_API_KEY=xxxxx

# Server
PORT=3001
NODE_ENV=development
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001/api
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Market Data
- `GET /api/market/featured` - Get featured stocks (top 500)
- `GET /api/market/search?q=RELIANCE` - Search stocks
- `GET /api/market/stock/:symbol` - Get stock details
- `GET /api/market/history/:symbol` - Historical data

### Portfolio
- `GET /api/portfolio` - Get user portfolio
- `GET /api/portfolio/holdings` - Get all holdings
- `POST /api/portfolio/buy` - Buy stock
- `POST /api/portfolio/sell` - Sell stock
- `GET /api/portfolio/trades` - Trade history
- `PUT /api/portfolio/budget` - Update budget

### AI Tutor
- `POST /api/ai/ask` - Ask AI a question
- `GET /api/ai/portfolio-insights` - Get AI portfolio insights
- `POST /api/ai/explain` - Explain financial concept
- `GET /api/ai/learning-path` - Get personalized learning path

### Voice AI
- `POST /api/voice/ask` - Ask question with voice response
- `POST /api/voice/explain` - Explain concept with voice
- `GET /api/voice/portfolio-insights` - Narrated portfolio insights
- `POST /api/voice/tts` - Text-to-speech conversion
- `GET /api/voice/voices` - List available voices

*Full API documentation in `backend/API_REFERENCE.md`*

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts & profiles
- `portfolios` - User portfolios with budget
- `holdings` - Current stock holdings
- `trades` - Trade history (buy/sell)
- `stocks` - NSE stock master data (1,999 stocks)
- `stock_prices` - Historical price data

### Learning System
- `lessons` - Educational content
- `user_progress` - Lesson completion tracking
- `quizzes` - Quiz questions & answers
- `quiz_attempts` - User quiz submissions

### Gamification
- `badges` - Achievement badges
- `user_badges` - User badge collection
- `cohorts` - Teacher-led classes

### AI & Voice
- `voice_sessions` - Voice interaction sessions
- `voice_interactions` - Individual voice exchanges
- `user_voice_preferences` - Voice settings per user

*Detailed schema in `backend/DATABASE_SCHEMA.md`*

## 🚢 Deployment

### Backend (Railway)
```bash
cd backend

# Push to GitHub main branch
git add -A
git commit -m "Update backend"
git push origin main

# Railway auto-deploys from GitHub
```

**Production URL**: https://devion-backend-prod-floral-sun-907-production.up.railway.app

### Frontend (Vercel)
```bash
cd frontend

# Deploy to production
vercel --prod
```

**Production URL**: https://invested-demo-1jv8p5dg6-shauryaasingh1603-gmailcoms-projects.vercel.app

*Full deployment guide in `DEPLOYMENT.md`*

## 📊 Database Import

The platform includes **1,999 NSE equity stocks** imported from `NSE Stocks Equity.csv`:

```bash
cd backend
npm run build
node dist/scripts/import-nse-stocks.js
```

**Import Summary**:
- Total stocks: 1,999 equity stocks
- Featured stocks: Top 500 by market cap
- Symbols include: RELIANCE, TCS, INFY, HDFC, ICICI, etc.

## 🎓 Features

### ✅ Implemented
- ✅ User authentication (signup/login/JWT)
- ✅ Portfolio management (buy/sell/holdings)
- ✅ Live market data (1,999 NSE stocks)
- ✅ AI tutor (GPT-5 powered Q&A)
- ✅ Voice AI (ElevenLabs TTS)
- ✅ Flexible budget system
- ✅ Trade history & performance tracking
- ✅ Real-time stock search
- ✅ Landing page & onboarding
- ✅ Dashboard & analytics
- ✅ Market explorer page
- ✅ Portfolio page with P&L
- ✅ Frontend-backend integration

### 🚧 In Progress
- 🚧 Lessons & quiz system
- 🚧 Badges & gamification
- 🚧 Leaderboard
- 🚧 Cohort management (for teachers)
- 🚧 Advanced charts & indicators

### 📝 Planned
- 📝 Subscription tiers (Free/Pro/Ultra)
- 📝 Payment integration (Razorpay)
- 📝 Admin dashboard
- 📝 Email notifications
- 📝 Mobile app (React Native)

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Test all endpoints
./test-api.sh

# Test specific features
./test-portfolio.sh
./test-flexible-budget.sh
```

### Frontend Tests
```bash
cd frontend

# Run linter
npm run lint

# Build for production
npm run build
```

## 📱 Platform Status

| Component | Status | URL |
|-----------|--------|-----|
| **Backend API** | ✅ Live | [Railway](https://devion-backend-prod-floral-sun-907-production.up.railway.app) |
| **Frontend Web** | ✅ Live | [Vercel](https://invested-demo-1jv8p5dg6-shauryaasingh1603-gmailcoms-projects.vercel.app) |
| **Database** | ✅ Live | Supabase (Mumbai) |
| **Stock Data** | ✅ Synced | 1,999 NSE stocks |
| **AI Tutor** | ✅ Active | GPT-5 (OpenAI) |
| **Voice AI** | ✅ Active | ElevenLabs |

## 🤝 Contributing

This is a **proprietary project** by Devion Industries. For collaboration inquiries, contact the team.

## 📄 License

**Proprietary** - All rights reserved by Devion Industries

## 👥 Team

**Devion Industries**  
Building the future of financial literacy in India 🇮🇳

---

### 📚 Additional Documentation

- `backend/README.md` - Backend specific docs
- `frontend/README.md` - Frontend specific docs
- `backend/API_REFERENCE.md` - Complete API documentation
- `backend/DATABASE_SCHEMA.md` - Database design
- `DEPLOYMENT.md` - Deployment guide
- `PLATFORM_STATUS.md` - Detailed platform status

---

**Made with ❤️ in India** | **Demo Live at Global Fintech Fest** 🚀
