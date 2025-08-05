# 🔄 PORTS CHANGED - NEW CONFIGURATION

## ✅ NEW PORT ASSIGNMENTS

- **Frontend**: http://localhost:6005 (was 3000)
- **Backend**: http://localhost:6003 (was 5000)

---

## 🚀 QUICK START WITH NEW PORTS

### **Method 1: Automated**
```bash
cd /Users/arad/dev/kits-wood/2-react-migrated-version
./kill-ports.sh
./run-systems.sh
```

### **Method 2: Manual**

**Terminal 1 - Backend:**
```bash
cd /Users/arad/dev/kits-wood/2-react-migrated-version/backend
node server.js
```
*Runs on: http://localhost:6003*

**Terminal 2 - Frontend:**
```bash
cd /Users/arad/dev/kits-wood/2-react-migrated-version/frontend
npm start
```
*Runs on: http://localhost:6005*

---

## ✅ WHAT WAS UPDATED

### **Backend Changes:**
- ✅ `.env` file: `PORT=6003`
- ✅ `server.js`: Default port changed to 6003
- ✅ CORS origins: Updated to allow localhost:6005

### **Frontend Changes:**
- ✅ `.env` file: `PORT=6005` and `REACT_APP_API_URL=http://localhost:6003/api/v1`

### **Scripts Updated:**
- ✅ `kill-ports.sh`: Now clears ports 6003 and 6005
- ✅ `run-systems.sh`: Updated with new port numbers
- ✅ `MANUAL_START.md`: Updated documentation

---

## 🌐 ACCESS URLS

Once both systems are running:

- **🖥️ Frontend App**: http://localhost:6005
- **🔌 Backend API**: http://localhost:6003/api/v1
- **💚 Health Check**: http://localhost:6003/health

---

## 🎯 EXPECTED BEHAVIOR

**Backend Console:**
```
🚀 Wood Kits API Server Started
📡 Server running on port 6003
🔗 API Base URL: http://localhost:6003/api/v1
💚 Health Check: http://localhost:6003/health
```

**Frontend Console:**
```
webpack compiled successfully
Local: http://localhost:6005
```

**Browser**: Opens to Wood Kits homepage at http://localhost:6005

---

## ✅ READY TO RUN

The port changes are complete. Both systems should now start without conflicts on the new ports 6005 (frontend) and 6003 (backend).