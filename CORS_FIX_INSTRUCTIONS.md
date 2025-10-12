# CORS Fix Instructions for Railway Deployment

## Issue
The frontend at `https://www.devion.in` is being blocked by CORS policy when trying to access the backend API at `https://devion-backend-prod-floral-sun-907-production.up.railway.app`.

## Root Cause
The `FRONTEND_URL` environment variable in Railway doesn't include `https://www.devion.in` (with www subdomain).

## Solution

### Step 1: Update Railway Environment Variables

1. Go to your Railway project dashboard
2. Navigate to the backend service variables
3. Update the `FRONTEND_URL` environment variable to include both domains:

```
FRONTEND_URL=https://devion.in,https://www.devion.in
```

Or if you also need localhost for development:

```
FRONTEND_URL=http://localhost:8086,https://devion.in,https://www.devion.in
```

### Step 2: Redeploy

After updating the environment variable, Railway should automatically redeploy the service. If it doesn't:
1. Click on "Deploy" in the Railway dashboard
2. Or trigger a new deployment by pushing a commit

### Step 3: Verify

Once the deployment is complete:
1. Test the login endpoint from your frontend
2. Check browser console for CORS errors
3. Verify the response headers include `Access-Control-Allow-Origin: https://www.devion.in`

## Technical Details

The CORS configuration is set in `src/index.ts`:
```typescript
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));
```

And `config.cors.origin` is loaded from `src/config/env.ts`:
```typescript
cors: {
  origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:8086']
}
```

This splits the comma-separated FRONTEND_URL into an array of allowed origins, which the cors middleware uses to validate incoming requests.

## Additional Notes

- The `credentials: true` option allows cookies and authentication headers to be sent with cross-origin requests
- Make sure your frontend is also sending `credentials: 'include'` in fetch/axios requests if needed
- Consider setting up a redirect from `devion.in` to `www.devion.in` (or vice versa) at the DNS/CDN level to avoid confusion
