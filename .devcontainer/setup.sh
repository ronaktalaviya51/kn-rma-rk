#!/bin/bash

# KN-RMA Development Environment Setup Script
echo "🚀 Setting up KN-RMA development environment..."

# Install global dependencies
echo "📦 Installing global dependencies..."
npm install -g @vue/cli typescript ts-node nodemon

# Setup backend
echo "🔧 Setting up backend..."
cd /workspace/backend
npm install

# Setup frontend
echo "🎨 Setting up frontend..."
cd /workspace/frontend
npm install

# Create uploads directory if it doesn't exist
echo "📁 Creating uploads directory..."
mkdir -p /workspace/uploads

# Set proper permissions
echo "🔐 Setting permissions..."
chmod 755 /workspace/uploads

echo "✅ Development environment setup complete!"
echo "🎉 You can now start developing!"
echo ""
echo "Available commands:"
echo "  - Backend: cd backend && npm run dev"
echo "  - Frontend: cd frontend && npm run serve"
echo "  - Database: Already running in Docker"
echo ""
echo "Available ports:"
echo "  - Frontend: http://localhost:8080"
echo "  - Backend API: http://localhost:3000"
echo "  - Database: localhost:3306"
