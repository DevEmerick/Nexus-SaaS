# Vercel Setup Guide - Quick Start

**Status:** 🟢 Ready for production deployment  
**Estimated setup time:** 15-20 minutes

---

## ⚡ Quick Deployment Checklist

### Step 1: Generate JWT Secret (2 minutes)

```bash
# Run this command and save the output
openssl rand -base64 32

# Example output:
# 2sQ5R7m9XyL8vKpQnWf3uZaB4cDgHjE8w6xP2n+Vk0c=
```

### Step 2: Get Database Connection String (1 minute)

1. Go to https://console.prisma.io
2. Select your Postgres database
3. Copy the connection string (starts with `postgres://`)
4. Save it for Step 5

### Step 3: Connect GitHub to Vercel (3 minutes)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository
4. Click "Import"

### Step 4: Configure Build Settings (2 minutes)

In the Vercel import dialog:
- **Framework:** Select "Other"
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Root Directory:** `./` (default)

Click "Deploy" (will fail until we add environment variables - that's OK)

### Step 5: Add Environment Variables (5 minutes)

After import, go to **Project Settings → Environment Variables** and add:

```
DATABASE_URL=postgres://...          [From Step 2]
PRISMA_DATABASE_URL=postgres://...   [Same as above]
JWT_SECRET=xxxxxxxxxxxxx...          [From Step 1]
FRONTEND_URL=https://your-app.vercel.app  [Will be provided by Vercel]
NODE_ENV=production
```

**To find your Vercel URL:**
- Go to Deployments tab
- Copy your domain (looks like `https://nexus-saas-abc123.vercel.app`)

### Step 6: Redeploy (1 minute)

1. Go to **Deployments**
2. Find the failed deployment
3. Click "..." → "Redeploy"
4. Wait for deployment to complete ✅

---

## 🧪 Test the Deployment

Once deployed, test these endpoints:

```bash
# Replace with your Vercel domain
API="https://your-app.vercel.app/api"

# 1. Health check
curl $API/health

# 2. Register user
curl -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}'

# 3. Login
TOKEN=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' | jq -r '.token')

# 4. Get profile (with token)
curl $API/auth/me -H "Authorization: Bearer $TOKEN"
```

---

## 📋 All Done? Here's What Happens

✅ **Frontend** (React app)
- Automatically built on every push to main
- Served from Vercel's edge network
- SSL/TLS certificate included

✅ **Backend** (Express API)
- Runs as Vercel Serverless Functions
- Automatically scales with traffic
- No need to manage servers

✅ **Database** (PostgreSQL)
- Connected to Vercel Postgres
- Automatic backups
- Monitored by Prisma

---

## 🔄 Updating Your App

**To deploy new changes:**

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel **automatically redeploys** when you push to main.

---

## ⚠️ Common Issues

### Build fails with "Cannot find module"
**Solution:** 
```bash
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### API returns 502 errors
**Solution:** Check environment variables in Vercel dashboard
- Ensure `DATABASE_URL` and `PRISMA_DATABASE_URL` are set
- Ensure `JWT_SECRET` is a strong string

### Frontend shows "API not found"
**Solution:** Frontend needs to know the API URL
- Update `src/hooks/api/useApi.js`:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```
- Add environment variable to Vercel:
```
REACT_APP_API_URL=https://your-app.vercel.app/api
```

---

## 📞 Still Have Questions?

Check these files for detailed information:
- **`DEPLOYMENT.md`** - Complete deployment guide
- **`API_DOCS_PRODUCTION.md`** - All API endpoints
- **`REACT_HOOKS_GUIDE.md`** - React hooks usage

---

## ✨ You're Done!

Your app is now:
- 🌍 Live on the internet
- 🔒 Secured with HTTPS
- ⚡ Fast with global CDN
- 📈 Scalable to millions of users
- 💰 Pay-as-you-go pricing

Congrats! 🎉

