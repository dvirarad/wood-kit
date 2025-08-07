# Railway Deployment Guide - Wood Kits E-Commerce

## Why Railway?
Railway is the **easiest platform to manage** with:
- ✅ **One account, one platform** for both frontend and backend
- ✅ **Automatic HTTPS** and domain management
- ✅ **Built-in database** (MongoDB/PostgreSQL)
- ✅ **Simple environment variables** management
- ✅ **GitHub integration** with automatic deployments
- ✅ **Free tier** available for testing

## Quick Setup (5 minutes)

### 1. Create Railway Account
```bash
# Visit https://railway.app and sign up with GitHub
# No need for multiple accounts or API keys!
```

### 2. Connect Your Repository
1. Go to Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your Wood Kits repository

### 3. Set Up Services Manually
**IMPORTANT**: Since your code is in `2-react-migrated-version/` folder, you need to create services manually:

**For Backend:**
1. Create new service → "Empty Service"
2. Name it "backend"
3. Go to Settings → Source → Connect Repository
4. Set **Root Directory** to: `2-react-migrated-version/backend`

**For Frontend:**
1. Create new service → "Empty Service" 
2. Name it "frontend"
3. Go to Settings → Source → Connect Repository
4. Set **Root Directory** to: `2-react-migrated-version/frontend`

**For Database:**
1. Click "Add Service" → "Database" → "Add MongoDB"

### 4. Configure Environment Variables
In Railway dashboard, set these for **Backend Service**:
```
NODE_ENV=production
MONGODB_URI=[Railway will auto-provide this]
JWT_SECRET=your-secure-jwt-secret-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
ADMIN_SEED_KEY=your-seed-key-123
CORS_ORIGIN=[Railway will auto-provide frontend URL]
PORT=3000
```

For **Frontend Service**:
```
REACT_APP_API_URL=[Railway will auto-provide backend URL]/api/v1
```

### 5. Set GitHub Secrets (for CI/CD)
Add these secrets to your GitHub repository:

```
RAILWAY_TOKEN=[Get from Railway settings]
BACKEND_URL=https://your-backend.railway.app
FRONTEND_URL=https://your-frontend.railway.app
ADMIN_SEED_KEY=your-seed-key-123
```

### 6. Deploy!
```bash
# Push to main branch - Railway will auto-deploy!
git push origin main
```

## That's it! 🎉

Your application will be live at:
- **Frontend**: `https://your-frontend.railway.app`
- **Backend API**: `https://your-backend.railway.app`
- **Admin Panel**: `https://your-frontend.railway.app/admin/login`

## Railway CLI (Optional)
```bash
# Install Railway CLI for manual deployments
curl -fsSL https://railway.app/install.sh | sh

# Login
railway login

# Deploy manually
cd backend && railway up
cd frontend && railway up
```

## Benefits vs Other Platforms:

| Platform | Complexity | Free Tier | Database | HTTPS | Maintenance |
|----------|------------|-----------|----------|-------|-------------|
| **Railway** | ⭐ Low | ✅ Yes | ✅ Built-in | ✅ Auto | ⭐ Minimal |
| Heroku | ⭐⭐ Medium | ❌ Limited | ❌ Extra $ | ✅ Auto | ⭐⭐ Medium |
| Vercel + Heroku | ⭐⭐⭐ High | ✅ Mixed | ❌ Extra $ | ✅ Auto | ⭐⭐⭐ High |
| AWS/GCP | ⭐⭐⭐⭐ Very High | ✅ Complex | ❌ Setup | ❌ Manual | ⭐⭐⭐⭐ Very High |

## Common Issues & Solutions

### Database Connection Issues
```bash
# Railway auto-provides MongoDB, but if you need to debug:
railway shell
echo $MONGODB_URI
```

### Environment Variables Not Loading
```bash
# Check Railway dashboard > Service > Variables tab
# Make sure all required variables are set
```

### Build Failures
```bash
# Check Railway logs
railway logs --service backend
railway logs --service frontend
```

## Advanced Configuration

### Custom Domains (Optional)
1. Go to Railway service settings
2. Add your domain
3. Update DNS records as shown
4. Railway handles SSL automatically

### Monitoring
Railway provides built-in monitoring:
- CPU/Memory usage
- Request logs
- Error tracking
- Deployment history

## Migration from Other Platforms
If you're currently on Heroku/Vercel:
1. Export environment variables
2. Connect Railway to same GitHub repo
3. Set environment variables in Railway
4. Deploy and test
5. Update DNS to Railway domains