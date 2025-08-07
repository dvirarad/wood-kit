# Wood Kits E-Commerce - Production Deployment Guide

## Overview
This guide covers deploying the Wood Kits E-Commerce Platform to production with automated CI/CD using GitHub Actions.

## Deployment Options

### Option 1: Heroku (Recommended for simplicity)
### Option 2: Vercel + Railway
### Option 3: AWS/DigitalOcean VPS
### Option 4: Docker + Any Cloud Provider

---

## 🚀 Option 1: Heroku Deployment (Easiest)

### Prerequisites
- Heroku account
- Heroku CLI installed
- MongoDB Atlas account (free tier available)

### Step 1: Prepare for Heroku

Create Heroku-specific files:

#### `backend/Procfile`
```
web: node server.js
```

#### `frontend/package.json` - Add build scripts
```json
{
  "scripts": {
    "build": "react-scripts build",
    "postbuild": "cp build/static/js/*.js build/static/js/main.js || true"
  }
}
```

### Step 2: Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for production
5. Get connection string

### Step 3: Deploy Backend to Heroku

```bash
# Navigate to backend
cd backend

# Login to Heroku
heroku login

# Create Heroku app for backend
heroku create your-app-name-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your-mongodb-atlas-connection-string"
heroku config:set JWT_SECRET="your-secure-jwt-secret-key"
heroku config:set ADMIN_USERNAME="admin"
heroku config:set ADMIN_PASSWORD="your-secure-admin-password"
heroku config:set ADMIN_SEED_KEY="your-seed-key"
heroku config:set CORS_ORIGIN="https://your-frontend-url.vercel.app"

# Deploy
git init
git add .
git commit -m "Initial backend deployment"
git push heroku main

# Seed the database
heroku run npm run seed
```

### Step 4: Deploy Frontend to Vercel

```bash
# Navigate to frontend
cd frontend

# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables in .env.production
echo "REACT_APP_API_URL=https://your-backend-app.herokuapp.com/api/v1" > .env.production

# Deploy
vercel --prod
```

---

## 🚀 Option 2: Vercel + Railway (Modern Stack)

### Backend on Railway

1. Go to [Railway](https://railway.app/)
2. Connect your GitHub repository
3. Create new project from GitHub repo
4. Select the backend folder
5. Add environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=your-mongodb-connection`
   - `JWT_SECRET=your-jwt-secret`
   - `ADMIN_USERNAME=admin`
   - `ADMIN_PASSWORD=secure-password`
   - `PORT=6003`

### Frontend on Vercel

1. Go to [Vercel](https://vercel.com/)
2. Import from Git repository
3. Set root directory to `frontend`
4. Add environment variable:
   - `REACT_APP_API_URL=https://your-railway-domain.up.railway.app/api/v1`
5. Deploy

---

## 🚀 Option 3: Docker Deployment

### Create Docker files

#### `backend/Dockerfile`
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 6003

CMD ["npm", "start"]
```

#### `frontend/Dockerfile`
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### `frontend/nginx.conf`
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:6003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### `docker-compose.yml` (root directory)
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: wood-kits-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: rootpassword
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    container_name: wood-kits-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://root:rootpassword@mongodb:27017/wood-kits?authSource=admin
      JWT_SECRET: your-jwt-secret-key
      ADMIN_USERNAME: admin
      ADMIN_PASSWORD: secure-admin-password
      CORS_ORIGIN: http://localhost:3000
      PORT: 6003
    ports:
      - "6003:6003"
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    container_name: wood-kits-frontend
    restart: unless-stopped
    environment:
      REACT_APP_API_URL: http://localhost:6003/api/v1
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### Deploy with Docker

```bash
# Build and run
docker-compose up -d

# Seed database
docker-compose exec backend npm run seed

# Check logs
docker-compose logs -f
```

---

## 🔄 GitHub Actions CI/CD

### Create GitHub Actions Workflow

#### `.github/workflows/deploy.yml`
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand(\"ismaster\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: |
          backend/package-lock.json
          frontend/package-lock.json

    # Backend Tests
    - name: Install Backend Dependencies
      run: |
        cd backend
        npm ci

    - name: Run Backend Tests
      run: |
        cd backend
        npm test
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://localhost:27017/wood-kits-test
        JWT_SECRET: test-secret

    # Frontend Tests
    - name: Install Frontend Dependencies
      run: |
        cd frontend
        npm ci

    - name: Build Frontend
      run: |
        cd frontend
        npm run build
      env:
        REACT_APP_API_URL: https://your-api-url.com/api/v1

    - name: Run Frontend Tests
      run: |
        cd frontend
        npm test -- --coverage --watchAll=false

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    # Deploy to Heroku
    - name: Deploy Backend to Heroku
      uses: akhileshns/heroku-deploy@v3.12.14
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-backend-app-name"
        heroku_email: "your-email@example.com"
        appdir: "backend"

    # Or deploy to Railway
    - name: Deploy Backend to Railway
      run: |
        npm i -g @railway/cli
        railway login --token ${{secrets.RAILWAY_TOKEN}}
        railway up
      env:
        RAILWAY_TOKEN: ${{secrets.RAILWAY_TOKEN}}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json

    - name: Install and Build
      run: |
        cd frontend
        npm ci
        npm run build
      env:
        REACT_APP_API_URL: ${{secrets.REACT_APP_API_URL}}

    # Deploy to Vercel
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{secrets.VERCEL_TOKEN}}
        vercel-org-id: ${{secrets.ORG_ID}}
        vercel-project-id: ${{secrets.PROJECT_ID}}
        working-directory: ./frontend
        vercel-args: '--prod'

  e2e-tests:
    needs: [deploy-backend, deploy-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install Dependencies
      run: npm ci

    - name: Install Playwright
      run: npx playwright install --with-deps

    - name: Run E2E Tests
      run: npm run test:e2e
      env:
        PLAYWRIGHT_BASE_URL: ${{secrets.FRONTEND_URL}}
        API_BASE_URL: ${{secrets.BACKEND_URL}}

    - name: Upload Test Results
      uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```

---

## 🔐 Environment Variables & Secrets

### Required GitHub Secrets

Add these to your GitHub repository settings → Secrets and variables → Actions:

#### For Heroku Deployment:
- `HEROKU_API_KEY`: Your Heroku API key
- `HEROKU_EMAIL`: Your Heroku account email

#### For Vercel Deployment:
- `VERCEL_TOKEN`: Vercel token
- `ORG_ID`: Vercel organization ID
- `PROJECT_ID`: Vercel project ID

#### For Railway Deployment:
- `RAILWAY_TOKEN`: Railway API token

#### Application Secrets:
- `REACT_APP_API_URL`: Frontend API URL
- `MONGODB_URI`: Production MongoDB connection string
- `JWT_SECRET`: Secure JWT secret key
- `ADMIN_USERNAME`: Production admin username
- `ADMIN_PASSWORD`: Secure admin password

### Production Environment Variables

#### Backend (.env.production):
```bash
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-secure-jwt-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-admin-password
CORS_ORIGIN=https://your-frontend-domain.com
PORT=6003
```

#### Frontend (.env.production):
```bash
REACT_APP_API_URL=https://your-backend-domain.com/api/v1
REACT_APP_ENV=production
```

---

## 🚀 Recommended Deployment Strategy

### 1. **For MVP/Testing**: Heroku + MongoDB Atlas
- **Cost**: Free tier available
- **Ease**: Very simple setup
- **Scalability**: Limited but sufficient for testing

### 2. **For Production**: Vercel + Railway + MongoDB Atlas
- **Cost**: $20-50/month
- **Ease**: Modern, good developer experience
- **Scalability**: Excellent auto-scaling

### 3. **For Enterprise**: AWS/GCP with Docker
- **Cost**: $100+/month
- **Ease**: More complex but flexible
- **Scalability**: Unlimited

---

## 📝 Deployment Checklist

### Pre-deployment:
- [ ] Set up MongoDB Atlas database
- [ ] Configure environment variables
- [ ] Test locally with production environment variables
- [ ] Run all tests (`npm run test:all`)
- [ ] Build frontend successfully (`npm run build`)

### Deployment:
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database seeded with products
- [ ] Admin login working
- [ ] API endpoints responding correctly
- [ ] CORS configured correctly

### Post-deployment:
- [ ] Run E2E tests against production
- [ ] Test admin product management
- [ ] Test customer product ordering flow
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy

### GitHub Actions Setup:
- [ ] Create `.github/workflows/deploy.yml`
- [ ] Add required secrets to GitHub repository
- [ ] Test deployment workflow
- [ ] Set up branch protection rules
- [ ] Configure automatic deployments on main branch merge

---

## 🔧 Troubleshooting Common Deployment Issues

### 1. CORS Errors
```javascript
// backend/server.js - ensure CORS is properly configured
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

### 2. Database Connection Issues
```javascript
// Ensure MongoDB URI includes proper authentication
mongodb+srv://username:password@cluster.mongodb.net/wood-kits?retryWrites=true&w=majority
```

### 3. Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build
```

### 4. Environment Variable Issues
```bash
# Verify environment variables are set
heroku config --app your-app-name
vercel env list
```

---

## 📊 Monitoring & Maintenance

### 1. Health Checks
```javascript
// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 2. Logging
```javascript
// Use structured logging
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});
```

### 3. Error Tracking
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- New Relic for performance monitoring

---

## 🎯 Next Steps After Deployment

1. **Set up custom domain**: Configure your own domain name
2. **SSL certificates**: Ensure HTTPS is enabled
3. **CDN**: Configure CDN for static assets
4. **Database backups**: Set up automated database backups
5. **Monitoring**: Set up uptime monitoring and alerts
6. **Analytics**: Integrate Google Analytics or similar
7. **Performance**: Optimize images and implement caching
8. **Security**: Regular security audits and updates

Your Wood Kits E-Commerce Platform is now ready for production deployment! 🎉