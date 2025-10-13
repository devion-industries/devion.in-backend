#!/bin/bash

# Devion Backend - Fly.io Deployment Script

echo "🚀 Deploying Devion Backend to Fly.io (Mumbai)..."
echo ""

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ Fly.io CLI not found. Please install it first:"
    echo "   brew install flyctl"
    echo "   or visit: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Please run:"
    echo "   flyctl auth login"
    exit 1
fi

echo "✅ Fly.io CLI found and authenticated"
echo ""

# Check if app exists
if flyctl status &> /dev/null; then
    echo "📦 App exists. Deploying update..."
else
    echo "🆕 First time deployment. Creating app..."
    echo ""
    echo "⚠️  IMPORTANT: During setup, choose region 'bom' (Mumbai, India)"
    echo ""
    read -p "Press Enter to continue..."
    flyctl launch --no-deploy
    echo ""
    echo "⚠️  Before deploying, set your secrets:"
    echo "   flyctl secrets set SUPABASE_URL=your_url"
    echo "   flyctl secrets set SUPABASE_KEY=your_key"
    echo "   flyctl secrets set JWT_SECRET=your_secret"
    echo "   flyctl secrets set OPENAI_API_KEY=your_key"
    echo ""
    read -p "Have you set all secrets? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Please set secrets first, then run this script again."
        exit 1
    fi
fi

# Deploy
echo ""
echo "🚢 Deploying to production..."
flyctl deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 App Status:"
    flyctl status
    echo ""
    echo "🌐 Your backend is live at:"
    echo "   https://devion-backend.fly.dev"
    echo ""
    echo "🔍 Health Check:"
    echo "   https://devion-backend.fly.dev/health"
    echo ""
    echo "📝 View logs:"
    echo "   flyctl logs"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "🐛 Check logs:"
    echo "   flyctl logs"
    echo ""
    exit 1
fi

