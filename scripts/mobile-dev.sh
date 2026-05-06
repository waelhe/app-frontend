#!/bin/bash
# Development script for Capacitor mobile app with live reload
# Starts Next.js dev server and opens Android with live reload

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📱 Starting نبض mobile development..."

# Get local IP
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')

if [ -z "$LOCAL_IP" ]; then
  echo "❌ Could not determine local IP address"
  echo "Please set it manually in capacitor.config.ts"
  exit 1
fi

echo "📡 Local IP: $LOCAL_IP"
echo "🔄 Update capacitor.config.ts with: url: 'http://${LOCAL_IP}:3000'"

# Start Next.js dev server in background
echo "🚀 Starting Next.js dev server..."
bun run dev &
DEV_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for dev server..."
sleep 5

# Open Android
if [ -d "android" ]; then
  echo "📱 Opening Android..."
  npx cap run android --livereload --url="http://${LOCAL_IP}:3000"
else
  echo "⚠️ Android platform not added. Run: npx cap add android"
fi

# Cleanup
kill $DEV_PID 2>/dev/null
