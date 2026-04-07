# Deployment Guide - Vercel

**Status:** ✅ Ready for production deployment  
**Last Updated:** April 7, 2026  
**Stack:** React (Frontend) + Express.js (Backend) + PostgreSQL (Database)

---

## 📋 Pre-Deployment Checklist

Before deploying to Vercel, ensure:

- [ ] All code is committed to `main` branch
- [ ] `.env.local` is in `.gitignore` (never commit secrets)
- [ ] Database migrations are applied (already done for Vercel Postgres)
- [ ] JWT_SECRET is generated (strong random string)
- [ ] Frontend URL is known (for CORS configuration)
- [ ] All endpoints tested locally
- [ ] React hooks updated to use environment variable for API_URL

---

## 🚀 Deployment Steps

### Step 1: Prepare Environment Variables

Generate a strong JWT secret:
```bash
# macOS/Linux
openssl rand -base64 32

# Output example: 
# 2sQ5R7m9XyL8vKpQnWf3uZaB4cDgHjE8w6xP2n+Vk0c=
```

### Step 2: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js (or "Other" for React)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Root Directory:** `./` (default)

### Step 3: Set Environment Variables in Vercel

In Vercel Project Settings → "Environment Variables", add:

| Variable Name | Value | Source |
|---------------|-------|--------|
| `DATABASE_URL` | Your Vercel Postgres connection string | Prisma Dashboard |
| `PRISMA_DATABASE_URL` | Same as DATABASE_URL | Prisma Dashboard |
| `JWT_SECRET` | Generated random string | `openssl rand -base64 32` |
| `FRONTEND_URL` | Your deployed frontend URL | Will be provided by Vercel |
| `NODE_ENV` | `production` | Manual entry |

**How to get Vercel Postgres Connection String:**
1. Go to [Prisma Dashboard](https://console.prisma.io)
2. Select your Postgres database
3. Copy the connection string
4. Paste into both `DATABASE_URL` and `PRISMA_DATABASE_URL`

### Step 4: Verify vercel.json Configuration

The `vercel.json` file is already configured with:
- ✅ Correct build command
- ✅ Correct output directory
- ✅ API routes configuration
- ✅ Environment variable references
- ✅ Rewrite rules for React SPA

### Step 5: Deploy

**Option A: Automatic Deployment (Recommended)**
- Push to main branch
- Vercel automatically detects and deploys

**Option B: Manual Deployment**
```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# Deploy
vercel
```

---

## 🔌 API Configuration

### Updating React Hooks for Production

The React hooks need to use the production API URL. Update `src/hooks/api/useApi.js`:

```javascript
// Before:
const API_URL = 'http://localhost:3001/api';

// After:
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

Then add to `.env.local` (development) and Vercel environment variables (production):
```
REACT_APP_API_URL=http://localhost:3001/api    # Development
REACT_APP_API_URL=https://your-api.vercel.app  # Production
```

### CORS Configuration

The Express server is configured to accept requests from:
- `http://localhost:3000` (development)
- `http://localhost:3001` (testing)
- `process.env.FRONTEND_URL` (production)

Make sure to set `FRONTEND_URL` to your Vercel frontend URL.

---

## 📊 Production Architecture

```
┌─────────────────────────────────────┐
│   Vercel Frontend Deployment        │
│   - React App (SPA)                 │
│   - Static assets cached            │
│   - Automatic SSL/TLS               │
└────────────┬────────────────────────┘
             │ API calls to
             │
┌────────────▼────────────────────────┐
│   Vercel Backend (Serverless)       │
│   - Express.js API                  │
│   - JWT Authentication              │
│   - CRUD Endpoints                  │
└────────────┬────────────────────────┘
             │ Database queries
             │
┌────────────▼────────────────────────┐
│   Vercel Postgres Database          │
│   - User data                       │
│   - Workspaces, Columns, Tasks      │
│   - Automatic backups               │
└─────────────────────────────────────┘
```

---

## 🔒 Security Considerations

### Before Going to Production

1. **JWT_SECRET** - Use strong random string (NOT the placeholder)
   ```bash
   openssl rand -base64 32
   ```

2. **Database Credentials** - Are stored in Vercel Secrets (not visible in logs)

3. **HTTPS/TLS** - Automatically configured by Vercel

4. **CORS** - Configured to only accept requests from your frontend domain

5. **Password Hashing** - Using bcryptjs with 10 salt rounds

### Monitoring & Logs

- View deployment logs: Vercel Dashboard → Deployments → Select deployment → Logs
- View function execution logs: Deployments → Runtime Logs
- Database connection issues: Check Prisma logs with `DEBUG=*` environment variable

---

## 🧪 Testing Deployment

After deployment, test all endpoints:

```bash
# Replace with your Vercel URL
BASE_URL="https://your-app.vercel.app/api"

# 1. Register a test user
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# 2. Login and get token
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Get user profile (test with token from step 2)
curl -X GET $BASE_URL/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Create workspace
curl -X POST $BASE_URL/workspaces \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Workspace","color":"#3B82F6"}'
```

---

## 📱 Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] User can register and login
- [ ] JWT tokens are issued correctly
- [ ] Workspaces can be created, read, updated, deleted
- [ ] Columns can be managed
- [ ] Tasks can be created and updated
- [ ] Soft deletes work (tasks disappear but aren't permanently deleted)
- [ ] Authorization checks work (403 on unauthorized access)
- [ ] Database is being used (check via Prisma dashboard)
- [ ] No sensitive data in logs
- [ ] SSL certificate is valid

---

## 🔄 Updating Production

### To deploy updates after initial deployment:

1. **Merge to main branch:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Vercel automatically deploys** (watch the dashboard)

3. **For database schema changes:**
   - If you modify `prisma/schema.prisma`:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
   - The migration is applied to production database automatically

### Rollback if needed:

1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find previous stable deployment
4. Click "..." menu → "Redeploy"

---

## 🐛 Troubleshooting

### Deployment Fails - Build Errors

**Solution:** 
- Check build logs in Vercel Dashboard
- Ensure all imports use correct paths (ES modules)
- Verify `package.json` has `"type": "module"`

### 502 Bad Gateway / API not responding

**Solution:**
- Check that `src/api/server.js` is properly configured
- Verify environment variables are set in Vercel
- Check database connection with: `vercel env pull`
- Review Postgres connection string for syntax errors

### CORS Errors in Browser

**Solution:**
- Ensure `FRONTEND_URL` is set to your actual deployed frontend URL
- Verify frontend URL has no trailing slash
- Check that `process.env.FRONTEND_URL` is included in CORS config

### 401 Unauthorized / Token issues

**Solution:**
- Verify JWT_SECRET is set and consistent
- Check that React hooks use correct Authorization header format
- Tokens expire after 7 days - user must login again

### Database connection timeout

**Solution:**
- Verify DATABASE_URL and PRISMA_DATABASE_URL are identical
- Check Vercel Postgres is running (Prisma dashboard)
- Ensure IP whitelist allows Vercel IPs (usually automatic)

---

## 📈 Monitoring & Performance

### Recommended setups for production:

1. **Error Tracking:** Sentry integration
   ```bash
   npm install @sentry/node
   ```

2. **Performance Monitoring:** Vercel Analytics (built-in)

3. **Database Monitoring:** Prisma Insights (Prisma dashboard)

4. **Logs:** Vercel provides automatic logging and retention

---

## 💰 Cost Estimate (Vercel + Prisma Postgres)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel Frontend | Pro | $20 |
| Vercel Serverless | Usage-based | ~$10-50 |
| Prisma Postgres | Starter | Free (up to 500MB) |
| | Starter+ | $29 (100GB) |
| **Total** | | **~$30-100** |

---

## Next Steps

1. **Generate JWT_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

2. **Add environment variables in Vercel dashboard**

3. **Push to GitHub main branch**

4. **Watch Vercel automatically deploy**

5. **Test all endpoints with production URL**

6. **Monitor logs and performance**

---

## Support & Documentation

- **Vercel Docs:** https://vercel.com/docs
- **Prisma Postgres:** https://prisma.io/postgres
- **Express.js Docs:** https://expressjs.com
- **React Docs:** https://react.dev

