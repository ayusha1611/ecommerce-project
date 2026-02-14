# Login Troubleshooting Guide

## Issue: "Invalid Credentials" Error

Follow these steps to fix login issues:

---

## Step 1: Check if Backend is Running

Open your browser and go to:
```
http://localhost:5000/api/auth/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Auth routes working",
  "adminUsername": "admin",
  "hasAdminPassword": true,
  "hasJwtSecret": true
}
```

If this doesn't work, your backend is not running or not accessible.

---

## Step 2: Check MongoDB Connection

Look at your backend terminal. You should see:
```
MongoDB connected successfully
Server running on port 5000
```

If you see connection errors:

### Fix MongoDB Issues:

**On Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**On Mac:**
```bash
brew services start mongodb-community
```

**On Linux:**
```bash
sudo systemctl start mongod
```

**Check if MongoDB is running:**
```bash
# Should show MongoDB process
ps aux | grep mongod
```

---

## Step 3: Verify .env File

Open `backend/.env` and make sure it looks like this:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shikhar-garments
JWT_SECRET=your-secret-key-change-this-in-production
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**Important:** 
- NO spaces around the `=` sign
- NO quotes around values
- File must be named exactly `.env` (with the dot)

---

## Step 4: Test Login with Terminal

### Test Admin Login:

Open a new terminal and run:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "admin",
    "password": "admin123",
    "isAdmin": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "name": "admin",
    "isAdmin": true
  }
}
```

### Test User Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "9876543210",
    "isAdmin": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "Test User",
    "phone": "9876543210",
    "isAdmin": false
  }
}
```

---

## Step 5: Check Browser Console

1. Open your browser (http://localhost:3000)
2. Press `F12` to open Developer Tools
3. Go to `Console` tab
4. Try to login
5. Look for error messages

Common errors:

### "Network Error" or "Failed to fetch"
- Backend is not running
- Backend is on wrong port
- CORS issue

**Fix:** Make sure backend is running on port 5000

### "401 Unauthorized"
- Wrong credentials
- .env file not loaded properly

**Fix:** Restart backend server after changing .env

---

## Step 6: Check Backend Logs

When you try to login, look at your backend terminal. You should see:

**For Admin Login:**
```
Login attempt: { name: 'admin', phone: 'missing', isAdmin: true }
Admin login attempt
Expected username: admin
Provided username: admin
Admin login successful
```

**For User Login:**
```
Login attempt: { name: 'John Doe', phone: 'provided', isAdmin: false }
Creating new user: John Doe 9876543210
New user created successfully
```

If you don't see these logs, the request is not reaching the backend.

---

## Step 7: Common Fixes

### Fix 1: Restart Backend
```bash
# Stop backend (Ctrl+C)
# Start again
cd backend
npm start
```

### Fix 2: Check Port 5000 is Free
```bash
# Kill any process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Fix 3: Reinstall Dependencies
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Fix 4: Check Frontend Proxy
Open `frontend/package.json` and verify:
```json
{
  "proxy": "http://localhost:5000"
}
```

### Fix 5: Clear Browser Cache
- Press `Ctrl+Shift+Delete`
- Clear cookies and cache
- Reload page

---

## Step 8: Manual Database Check

If user login still fails, check MongoDB:

```bash
# Connect to MongoDB
mongosh

# Switch to database
use shikhar-garments

# Check users collection
db.users.find()

# If empty, that's okay - users are created on first login
```

---

## Step 9: Test with Postman/Insomnia

If browser login doesn't work, test with Postman:

1. Download Postman (free)
2. Create a POST request to: `http://localhost:5000/api/auth/login`
3. Set Headers: `Content-Type: application/json`
4. Body (raw JSON):

**Admin:**
```json
{
  "name": "admin",
  "password": "admin123",
  "isAdmin": true
}
```

**User:**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "isAdmin": false
}
```

---

## Step 10: Check CORS

If you see CORS errors in browser console:

Open `backend/server.js` and verify:
```javascript
app.use(cors());
```

is present before route definitions.

---

## Quick Checklist

✅ MongoDB is running
✅ Backend server is running on port 5000
✅ Frontend is running on port 3000
✅ .env file exists with correct values
✅ No spaces in .env file
✅ Backend shows "MongoDB connected successfully"
✅ http://localhost:5000/api/auth/test returns success
✅ Browser console shows no errors
✅ Correct credentials:
   - Admin: username `admin`, password `admin123`
   - User: any name + 10-digit phone number

---

## Still Not Working?

### Option 1: Use Default Simple Auth

Replace `backend/routes/auth.js` with this simple version:

```javascript
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/login', async (req, res) => {
  try {
    const { name, phone, password, isAdmin } = req.body;

    // Admin login
    if (isAdmin) {
      if (name === 'admin' && password === 'admin123') {
        const token = jwt.sign(
          { id: 'admin', name: 'admin', isAdmin: true },
          'secret-key',
          { expiresIn: '24h' }
        );
        
        return res.json({
          success: true,
          token,
          user: { name: 'admin', isAdmin: true }
        });
      } else {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials. Use admin/admin123' 
        });
      }
    }

    // User login
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a 10-digit phone number' 
      });
    }

    let user = await User.findOne({ phone });
    
    if (!user) {
      user = new User({ name, phone, isAdmin: false });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, phone: user.phone, isAdmin: false },
      'secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isAdmin: false
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false });
    }
    const decoded = jwt.verify(token, 'secret-key');
    res.json({ success: true, user: decoded });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

module.exports = router;
```

Then restart backend.

---

## Contact Support

If nothing works, please provide:
1. Backend terminal output
2. Browser console errors (F12 → Console)
3. Response from http://localhost:5000/api/auth/test
4. Operating system (Windows/Mac/Linux)

---

**Most Common Issue:** Backend not running or MongoDB not connected!

**Quick Fix:** 
```bash
# Terminal 1
mongod

# Terminal 2
cd backend
npm start

# Terminal 3
cd frontend
npm start
```
