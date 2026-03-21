#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Starting 512AI Admin Editor..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Open browser after 1.5 seconds
(sleep 1.5 && open "http://localhost:3512/editor") &

# Start server
node server.js
