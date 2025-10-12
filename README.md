# Devion Backend API

AI-powered financial literacy platform backend built with Node.js, Express, TypeScript, and Supabase.

## Features

- 🔐 JWT-based authentication
- 💰 Virtual portfolio management
- 📈 Real-time NSE market data (Kite Connect)
- 🎓 AI-powered learning system (GPT-4 + ElevenLabs)
- 🎮 Gamification (badges, challenges, leaderboards)
- 💳 Subscription management (Razorpay)
- 📧 Email notifications
- 🔄 Real-time WebSocket updates

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth + JWT
- **APIs**: Kite Connect, OpenAI GPT-4, ElevenLabs
- **Payments**: Razorpay
- **Logging**: Winston

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase project
- Kite Connect API credentials
- OpenAI API key
- ElevenLabs API key
- Razorpay account

## Installation

1. **Clone the repository**
   ```bash
   cd Backend/devion-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your credentials:**
   - Supabase URL and keys
   - Kite Connect credentials
   - OpenAI API key
   - ElevenLabs API key
   - Razorpay keys
   - JWT secret

5. **Database Setup**
   
   All database tables are already created via Supabase migrations.
   The schema includes:
   - Users & authentication
   - Portfolios & trading
   - Market data
   - Learning content
   - Gamification
   - Subscriptions & payments

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
src/
├── config/          # Configuration files
│   ├── env.ts      # Environment variables
│   └── database.ts # Supabase client
├── middleware/      # Express middleware
│   ├── auth.ts     # JWT authentication
│   ├── errorHandler.ts
│   └── logger.ts
├── routes/         # API routes
│   ├── auth.routes.ts
│   ├── market.routes.ts
│   ├── portfolio.routes.ts
│   ├── lessons.routes.ts
│   ├── quiz.routes.ts
│   ├── voice.routes.ts
│   ├── badges.routes.ts
│   └── subscription.routes.ts
├── controllers/    # Route controllers
├── services/       # Business logic
├── types/          # TypeScript types
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)
- `PATCH /api/auth/profile` - Update profile (protected)

### Market
- `GET /api/market/stocks` - Get all NSE stocks
- `GET /api/market/stocks/featured` - Get top 500 stocks
- `GET /api/market/stocks/search?q=query` - Search stocks
- `GET /api/market/stocks/:symbol` - Get stock details

### Portfolio
- `GET /api/portfolio` - Get user portfolio (protected)
- `GET /api/portfolio/holdings` - Get holdings (protected)
- `POST /api/portfolio/buy` - Execute buy order (protected)
- `POST /api/portfolio/sell` - Execute sell order (protected)

### Learning
- `GET /api/lessons` - Get all lessons (protected)
- `GET /api/lessons/:id` - Get lesson details (protected)
- `GET /api/quiz` - Get quizzes (protected)

### Voice AI
- `POST /api/voice/session/start` - Start voice session (protected)

### Gamification
- `GET /api/badges` - Get user badges (protected)

### Subscriptions
- `GET /api/subscription/plans` - Get subscription plans
- `GET /api/subscription/current` - Get current subscription (protected)

## Environment Variables

See `.env.example` for all required environment variables.

## Demo vs Production

**Current Status**: This is a demonstration/development version.

**Demo Features**:
- Static market data seeding
- Simulated trade execution
- Test payment processing

**Production TODO**:
- Enable live Kite Connect market data
- Implement WebSocket for real-time updates
- Set up Redis caching
- Configure production database backups
- Enable Sentry error tracking
- Set up CI/CD pipeline

## Security

- All passwords hashed with bcrypt
- JWT tokens for authentication
- Rate limiting on API endpoints
- Input validation with Zod
- SQL injection protection (parameterized queries)
- XSS protection with Helmet
- CORS configured for specific origins

## Deployment

### Recommended Platforms
- Railway.app
- Render.com
- Fly.io
- Heroku

### Deployment Steps
1. Set environment variables on platform
2. Build application: `npm run build`
3. Start application: `npm start`
4. Configure health check endpoint: `/health`

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Troubleshooting

### Server won't start
- Check all environment variables are set correctly
- Verify Supabase URL and keys
- Ensure database migrations are applied

### Authentication errors
- Verify JWT secret is set
- Check Supabase Auth configuration
- Confirm user exists in database

### Market data not loading
- Verify Kite Connect credentials
- Check API rate limits
- Ensure market is open (trading hours)

## License

ISC

## Contributors

Devion Team

## Support

For issues or questions, contact: support@devion.in

