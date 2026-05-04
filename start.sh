#!/bin/bash
echo "🌿 Starting FoodSaver..."
echo ""
echo "Starting backend on port 5000..."
cd backend && npm install --silent && node server.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo ""
echo "Starting frontend on port 3000..."
cd ../frontend && npm install --silent && npm start &
FRONTEND_PID=$!

echo ""
echo "✅ FoodSaver is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   API Docs: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop both services."
wait
