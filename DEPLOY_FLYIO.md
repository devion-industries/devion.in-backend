# 🚀 Deploying Devion Backend to Fly.io (Mumbai)

## Prerequisites

1. **Install Fly.io CLI:**
   ```bash
   # macOS
   brew install flyctl
   
   # Or via curl
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly.io:**
   ```bash
   flyctl auth login
   ```

---

## 🎯 Initial Deployment (First Time Only)

### Step 1: Create Fly.io App

```bash
cd /Users/shauryasingh/Documents/AI\ mock\ trader/Backend/devion-backend

# Launch app (this will use fly.toml configuration)
flyctl launch --no-deploy
```

**During launch:**
- Confirm app name: `devion-backend`
- Choose region: **bom (Mumbai, India)**
- Do not deploy yet (we need to set secrets first)

---

### Step 2: Set Environment Variables (Secrets)

```bash
# Supabase Configuration
flyctl secrets set SUPABASE_URL="your_supabase_url"
flyctl secrets set SUPABASE_KEY="your_supabase_anon_key"
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# JWT Secret (generate a strong secret)
flyctl secrets set JWT_SECRET="your_very_secure_jwt_secret_here"

# OpenAI API Key
flyctl secrets set OPENAI_API_KEY="your_openai_api_key"

# ElevenLabs API Key (if you have it)
flyctl secrets set ELEVENLABS_API_KEY="your_elevenlabs_api_key"

# Razorpay Keys (for payments - when ready)
flyctl secrets set RAZORPAY_KEY_ID="your_razorpay_key_id"
flyctl secrets set RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# CORS Origins (your frontend URL)
flyctl secrets set CORS_ORIGIN="https://devion-frontend.vercel.app,http://localhost:8086"
```

**To view secrets:**
```bash
flyctl secrets list
```

---

### Step 3: Deploy to Fly.io

```bash
# Deploy the app
flyctl deploy

# This will:
# 1. Build Docker image
# 2. Push to Fly.io registry
# 3. Deploy to Mumbai region
# 4. Start the app
```

---

## 🔄 Subsequent Deployments (Every Update)

After making changes to your backend code:

```bash
# Navigate to backend directory
cd /Users/shauryasingh/Documents/AI\ mock\ trader/Backend/devion-backend

# Deploy latest changes
flyctl deploy

# Or use shorthand
fly deploy
```

**That's it!** Every `fly deploy` will:
- Build new Docker image
- Deploy to production
- Zero-downtime deployment
- Auto-rollback if health checks fail

---

## 📊 Monitoring & Management

### Check App Status
```bash
flyctl status
```

### View Logs (Real-time)
```bash
flyctl logs
```

### View Specific Log Lines
```bash
flyctl logs --app devion-backend -n 100
```

### SSH into Machine
```bash
flyctl ssh console
```

### Check Health
```bash
curl https://devion-backend.fly.dev/health
```

### Scale Up/Down
```bash
# Scale to 2 machines for redundancy
flyctl scale count 2

# Scale up memory
flyctl scale memory 1024

# Scale up CPU
flyctl scale vm shared-cpu-2x
```

---

## 🌐 Your Backend URLs

After deployment, your backend will be available at:

- **Production URL:** `https://devion-backend.fly.dev`
- **Health Check:** `https://devion-backend.fly.dev/health`
- **API Base:** `https://devion-backend.fly.dev/api`

**Example API Endpoints:**
- Auth: `https://devion-backend.fly.dev/api/auth/login`
- Market: `https://devion-backend.fly.dev/api/market/stocks`
- Portfolio: `https://devion-backend.fly.dev/api/portfolio`

---

## 🔧 Update Frontend to Use Production Backend

In your frontend `.env.production`:

```bash
VITE_API_URL=https://devion-backend.fly.dev
```

---

## 💰 Pricing

**Fly.io Free Tier Includes:**
- 3 shared-cpu-1x machines (256MB RAM)
- 160GB outbound data transfer
- Enough for development/small production

**Current Config (fly.toml):**
- 1x shared-cpu-1x (512MB RAM)
- Mumbai region (bom)
- Auto-scaling enabled
- **Cost:** ~$5-10/month

---

## 🐛 Troubleshooting

### App won't start?
```bash
# Check logs
flyctl logs

# Check secrets are set
flyctl secrets list

# SSH into machine
flyctl ssh console
```

### Health check failing?
```bash
# Test locally first
docker build -t devion-backend .
docker run -p 3001:3001 --env-file .env devion-backend
curl http://localhost:3001/health
```

### Database connection issues?
```bash
# Verify Supabase URL in secrets
flyctl secrets list

# Check if Supabase allows connections from Fly.io IPs
# Supabase has no IP restrictions by default
```

### Need to reset?
```bash
# Destroy and recreate
flyctl apps destroy devion-backend
flyctl launch
```

---

## 🔐 Security Best Practices

1. **Never commit secrets** to git
2. **Use Fly.io secrets** for all sensitive data
3. **Enable HTTPS only** (already configured in fly.toml)
4. **Restrict CORS** to your frontend domain only
5. **Use rate limiting** (already implemented in backend)
6. **Monitor logs** regularly for suspicious activity

---

## 📈 CI/CD Automation (Optional)

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to Fly.io

on:
  push:
    branches: [main]
    paths:
      - 'Backend/devion-backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        working-directory: ./Backend/devion-backend
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

---

## ✅ Deployment Checklist

- [ ] Install Fly.io CLI
- [ ] Login to Fly.io account
- [ ] Run `flyctl launch` (choose Mumbai region)
- [ ] Set all secrets via `flyctl secrets set`
- [ ] Run `flyctl deploy`
- [ ] Test health endpoint
- [ ] Test API endpoints with Postman/curl
- [ ] Update frontend `.env.production`
- [ ] Deploy frontend to Vercel
- [ ] Test end-to-end (frontend → backend)
- [ ] Monitor logs for errors
- [ ] Set up automatic deployments (optional)

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ `https://devion-backend.fly.dev/health` returns `{"status":"ok"}`
- ✅ Backend logs show "Server started on port 3001"
- ✅ Frontend can connect to backend APIs
- ✅ User can signup, login, and trade stocks
- ✅ No errors in Fly.io logs

---

**Need Help?**
- Fly.io Docs: https://fly.io/docs
- Fly.io Status: https://status.fly.io
- Community: https://community.fly.io

**Deployed by:** Devion Development Team  
**Date:** October 10, 2025  
**Region:** Mumbai (bom)  
**Status:** 🚀 Production Ready

