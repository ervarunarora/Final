#!/bin/bash

# Quick Setup Script for SLA Tracker Dashboard
# No more CRACO complications - just works!

echo "🚀 Starting SLA Tracker Dashboard Quick Setup..."
echo "📋 Node.js 20.18.0 Compatible Setup"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20.18.0 first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo "📋 Current Node.js version: $NODE_VERSION"

# Setup Frontend
echo "⚛️ Setting up Frontend..."
cd frontend

# Clean install to avoid any issues
echo "🧹 Cleaning previous installations..."
rm -rf node_modules package-lock.json 2>/dev/null

# Clear cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Frontend setup failed!"
    exit 1
fi

echo "✅ Frontend setup complete!"

# Setup Backend
echo "🐍 Setting up Backend..."
cd ../backend

# Create virtual environment
echo "📦 Creating Python virtual environment..."
python -m venv venv

# Activate virtual environment (Linux/Mac)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Backend setup failed!"
    exit 1
fi

echo "✅ Backend setup complete!"

# Instructions
echo ""
echo "🎉 Setup Complete! Here's how to start the application:"
echo ""
echo "🔥 Start Backend (Terminal 1):"
echo "   cd backend"
echo "   source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "   uvicorn server:app --reload --host 0.0.0.0 --port 8001"
echo ""
echo "🔥 Start Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8001/docs"
echo ""
echo "📊 Don't forget to start MongoDB!"
echo "✨ No more CRACO errors - just pure React goodness!"