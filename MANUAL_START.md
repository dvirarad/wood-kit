# 🚀 Manual Startup Guide - GUARANTEED TO WORK

## Step 1: Clear All Ports

**Run this first to ensure clean startup:**

```bash
cd /Users/arad/dev/kits-wood/2-react-migrated-version
chmod +x kill-ports.sh
./kill-ports.sh
```

## Step 2: Start Backend (Terminal 1)

```bash
cd /Users/arad/dev/kits-wood/2-react-migrated-version/backend
node server.js
```

**Expected Output:**
```
🚀 Wood Kits API Server Started
📡 Server running on port 6003
🌍 Environment: development
🔗 API Base URL: http://localhost:6003/api/v1
💚 Health Check: http://localhost:6003/health
✅ Connected to MongoDB
```

## Step 3: Start Frontend (Terminal 2)

```bash
cd /Users/arad/dev/kits-wood/2-react-migrated-version/frontend
npm start
```

**Expected Output:**
```
webpack compiled successfully
Local: http://localhost:6005
On Your Network: http://192.168.x.x:6005
```

## Step 4: Access Application

Open browser to: **http://localhost:6005**

You should see:
- ✅ Wood Kits homepage with product catalog
- ✅ 6 configurable wood products  
- ✅ Language switcher (English/Hebrew/Spanish)
- ✅ Shopping cart functionality
- ✅ Product configurator with sliders

---

## 🔧 Alternative: One-Command Startup

If you prefer the automated script:

```bash
cd /Users/arad/dev/kits-wood/2-react-migrated-version
./kill-ports.sh && sleep 3 && ./run-systems.sh
```

---

## 🚨 If Still Having Issues

**Backend won't start:**
```bash
# Check what's using port 6003
lsof -i:6003

# Kill everything on port 6003
sudo lsof -ti:6003 | xargs kill -9

# Then start backend
cd backend && node server.js
```

**Frontend won't start:**
```bash
# Check what's using port 6005
lsof -i:6005

# Kill everything on port 6005  
sudo lsof -ti:6005 | xargs kill -9

# Then start frontend
cd frontend && npm start
```

---

## ✅ SYSTEM IS READY

Both systems are now properly configured and should start without issues using the manual method above.