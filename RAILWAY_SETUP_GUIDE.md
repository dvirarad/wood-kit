# Railway Setup - Step by Step

## Quick Setup (5 minutes)

### Step 1: Update Your Current Service
1. **Go to your existing service settings**
2. **Change Root Directory** from `2-react-migrated-version` to `2-react-migrated-version/backend`
3. **Click "Update"**

### Step 2: Add Environment Variables to Backend Service
In your current service, go to **Variables** tab and add:

```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_SEED_KEY=seed-key-123
PORT=3000
```

### Step 3: Create Frontend Service
1. **Click "+ New Service"** → **"Empty Service"**
2. **Name**: `frontend`
3. **Connect GitHub**: Select `dvirarad/wood-kit`
4. **Root Directory**: `2-react-migrated-version/frontend`
5. **Custom Start Command**: `npx serve -s build -p $PORT`

### Step 4: Add MongoDB Database
1. **Click "+ New Service"** → **"Database"** → **"MongoDB"**
2. Railway will automatically create connection string

### Step 5: Connect Services
**Backend Variables (add these to your backend service):**
```
MONGODB_URI=${{MongoDB.DATABASE_URL}}
```

**Frontend Variables (add to frontend service):**
```
REACT_APP_API_URL=https://[your-backend-url].railway.app/api/v1
```

### Step 6: Deploy Both Services
1. **Push this commit** (I've added railway.toml for auto-config)
2. **Both services should deploy automatically**

### Step 7: Get URLs and Test
After deployment:
1. **Copy backend URL** from Railway dashboard
2. **Update frontend REACT_APP_API_URL** with backend URL
3. **Test**: Open frontend URL in browser

## Your URLs will be:
- **Frontend**: `https://frontend-xxx.railway.app`
- **Backend API**: `https://backend-xxx.railway.app/api/v1`
- **Admin Panel**: `https://frontend-xxx.railway.app/admin/login`

## Need Help?
If you get stuck on any step, just tell me which step and I'll help you through it!