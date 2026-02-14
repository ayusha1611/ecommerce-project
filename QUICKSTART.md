# Quick Start Guide

## Prerequisites
- Node.js (v14+)
- MongoDB
- Git

## Installation (Automated)

Run the setup script:
```bash
chmod +x setup.sh
./setup.sh
```

## Installation (Manual)

### 1. Backend Setup
```bash
cd backend
npm install
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Environment Configuration

Update `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shikhar-garments
JWT_SECRET=your-secret-key-here
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 4. Start MongoDB
```bash
mongod
```

### 5. Start Backend (Terminal 1)
```bash
cd backend
npm start
```

### 6. Start Frontend (Terminal 2)
```bash
cd frontend
npm start
```

## Access the Application

- **User Website**: http://localhost:3000
- **API Server**: http://localhost:5000
- **Admin Login**: admin / admin123

## First Steps

### As Admin:
1. Login with admin credentials
2. Add products with images
3. Manage orders and users

### As User:
1. Browse products on homepage
2. Click login and enter name + phone
3. Add products to cart
4. Complete payment via Razorpay

## File Structure Overview

```
backend/
├── models/          # MongoDB schemas
├── routes/          # API endpoints
├── middleware/      # Auth middleware
├── config/          # Database config
└── server.js        # Main server

frontend/
├── src/
│   ├── components/  # React components
│   ├── context/     # State management
│   └── App.js       # Main app
└── public/          # Static files
```

## Common Commands

### Backend
```bash
npm start        # Start server
npm run dev      # Start with nodemon
```

### Frontend
```bash
npm start        # Start development server
npm run build    # Build for production
```

## Troubleshooting

### Port already in use:
```bash
kill -9 $(lsof -t -i:5000)  # Backend
kill -9 $(lsof -t -i:3000)  # Frontend
```

### MongoDB connection error:
- Check if MongoDB is running
- Verify MONGODB_URI in .env
- Ensure MongoDB service is started

### Module not found:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Key Features

✅ User authentication (name + phone)
✅ Admin authentication (username + password)
✅ Product management (CRUD)
✅ Shopping cart
✅ Razorpay payment integration
✅ Product reviews and ratings
✅ Order management
✅ Responsive design
✅ IndiaMART-inspired UI

## Support

For issues or questions, check the main README.md file.
