#!/bin/bash

echo "🚀 Setting up Shikhar Garments E-Commerce Website"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB first."
    echo "   Visit: https://docs.mongodb.com/manual/installation/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ MongoDB found"

# Backend setup
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Frontend setup
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Create uploads directory
echo ""
echo "📁 Creating uploads directory..."
cd ../backend
mkdir -p uploads
echo "✅ Uploads directory created"

echo ""
echo "=================================================="
echo "✅ Setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Make sure MongoDB is running: mongod"
echo "2. Update backend/.env with your configuration"
echo "3. Start backend: cd backend && npm start"
echo "4. Start frontend: cd frontend && npm start"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:5000"
echo ""
echo "👤 Default Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "Happy coding! 🎉"
