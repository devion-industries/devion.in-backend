# Devion – AI-Powered Financial Literacy Platform

🎯 **India's first AI-powered financial literacy simulator helping students learn investing through simulation, not speculation.**

## 🚀 Live Demo

**Production Demo**: [https://invested-demo-8mvlck9r9-shauryaasingh1603-gmailcoms-projects.vercel.app](https://invested-demo-8mvlck9r9-shauryaasingh1603-gmailcoms-projects.vercel.app)

## 📖 About Devion

Devion bridges the gap between finance and education by making investing concepts easy, interactive, and risk-free. Students learn by doing — through virtual portfolios, quizzes, and an AI tutor that explains every concept in simple terms.

### ✨ Key Features

- **🤖 AI Tutor**: Conversational AI that explains financial concepts in English or Hinglish
- **📈 Paper Trading**: Practice trading with ₹1,00,000 virtual money using real market prices  
- **🏆 Gamified Learning**: Earn badges, complete challenges, and compete with classmates
- **📊 Portfolio Insights**: Understand diversification, track performance, and learn how real investors think

## 🎭 Demo vs Production

### 🧪 **This is a DEMO Version**

**"This is a demonstration of Devion's upcoming platform — our full product is currently in production."**

This demonstration showcases the core features and user experience of Devion. Please note:

- **✅ Fully functional demo** with all features working
- **📊 Static market data** - Uses realistic NSE company data but not live feeds
- **🎯 Educational focus** - All trades are simulated with paper money
- **⚠️ Not financial advice** - Educational simulator only
- **🚀 Live at Global Fintech Fest** - Demo version showcasing FinTech + EdTech synergy

### 🏗️ **Production Roadmap**

The full production version will include:

- **Phase 1** (Current Demo): AI Tutor + Paper Trading
- **Phase 2** (In Development): Gamification + Leaderboards + Adaptive Quizzes  
- **Phase 3** (Future Vision): Voice Tutor + Regional Languages + Teacher Dashboards

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Charts**: Recharts (Area charts for better UX)
- **Icons**: Lucide React
- **Routing**: React Router
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm (install with [nvm](https://github.com/nvm-sh/nvm))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd learn-trade-coach

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui base components
│   ├── layout/         # Layout components (AppLayout)
│   ├── CandlestickChart.tsx  # Area chart component
│   ├── StockDetailModal.tsx  # Company details modal
│   └── ...
├── pages/              # Main application pages
│   ├── Index.tsx       # Landing page
│   ├── Dashboard.tsx   # Portfolio dashboard
│   ├── Market.tsx      # Stock market page
│   ├── Portfolio.tsx   # Portfolio management
│   ├── Learn.tsx       # Educational content
│   ├── Quiz.tsx        # Interactive quizzes
│   ├── Badges.tsx      # Gamification system
│   └── ...
├── data/               # Static data sources
│   └── mockStocks.ts   # NSE company data (static)
└── lib/                # Utility functions
```

## 📊 Static Data Sources

### Company Data (`src/data/mockStocks.ts`)

Contains comprehensive data for 15 major NSE companies including:

- **Basic Info**: Symbol, name, sector, current price
- **Fundamentals**: Market cap, P/E ratio, dividend yield, beta
- **Price Data**: 52-week high/low, current pricing
- **Descriptions**: Detailed company profiles sourced from public information

**Note**: This static data is used for demonstration. The production version will integrate with live NSE data feeds.

### Chart Data Generation

Chart data is dynamically generated based on:
- Stock's current LTP (Last Traded Price)
- Configurable volatility for different timeframes
- Realistic date labeling (hourly, daily, weekly, monthly)
- Volume data simulation

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (financial trust)
- **Secondary**: Purple accent
- **Success**: Green (gains)
- **Destructive**: Red (losses)
- **Warning**: Orange (alerts)

### Typography
- **Headers**: Bold, modern sans-serif
- **Body**: Readable, accessible font sizing
- **Code**: Monospace for data display

## 📱 Responsive Design

- **Mobile First**: Optimized for smartphones
- **Tablet**: Enhanced layouts for medium screens  
- **Desktop**: Full-featured experience
- **Accessibility**: ARIA labels, keyboard navigation, dark mode

## 🔧 Configuration

### Environment Variables

No environment variables required for the demo version.

### Build Settings

- **Vite Config**: Optimized for React + TypeScript
- **Vercel Config**: SPA routing with proper fallbacks
- **Tailwind**: Custom theme extensions for financial UI

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build verification
npm run build
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

### Manual Deployment

```bash
# Build production assets
npm run build

# Deploy the 'dist' folder to your hosting provider
```

## 📄 License

Educational demonstration project. All company data used for educational purposes only.

## 🤝 Contributing

This is a demonstration project. For inquiries about the production version:

- **Email**: [info@invested.ai](mailto:info@invested.ai)
- **LinkedIn**: [Connect with us](#)

## ⚠️ Disclaimer

**Educational simulator only. Not financial advice.**

All trades are simulated with paper money. This platform is designed for educational purposes to teach financial literacy. No real money is involved, and no actual trading occurs.

---

**Made with ❤️ for financial education in India**