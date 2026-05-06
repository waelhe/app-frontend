#!/bin/bash
# Build script for Capacitor mobile app
# Exports Next.js as static HTML, then copies to Capacitor

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📱 Building نبض mobile app..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

CONFIG_FILE="next.config.ts"
BACKUP_FILE="next.config.ts.backup"

# Backup original config
echo "${YELLOW}📦 Backing up next.config.ts...${NC}"
cp "$CONFIG_FILE" "$BACKUP_FILE"

# Restore on exit
restore_config() {
  if [ -f "$BACKUP_FILE" ]; then
    echo "${YELLOW}🔄 Restoring original next.config.ts...${NC}"
    mv "$BACKUP_FILE" "$CONFIG_FILE"
  fi
}
trap restore_config EXIT

# Create mobile-specific config
echo "${YELLOW}⚙️ Creating mobile export config...${NC}"
cat > "$CONFIG_FILE" << 'MOBILE_CONFIG'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
MOBILE_CONFIG

# Build static export
echo "${YELLOW}🏗️ Building static export...${NC}"
bun run build

# Check if out directory exists
if [ ! -d "out" ]; then
  echo "${RED}❌ Build failed: 'out' directory not found${NC}"
  exit 1
fi

echo "${GREEN}✅ Static export complete!${NC}"

# Add mobile-specific files to output
echo "${YELLOW}📱 Adding mobile-specific files...${NC}"

# Create a capacitor.js file for mobile detection in the output
cat > "out/capacitor.js" << 'CAPACITOR_DETECT'
// Capacitor mobile app detection
window.Capacitor = window.Capacitor || {};
window.IS_MOBILE_APP = true;
CAPACITOR_DETECT

# Copy to Capacitor
if [ -d "android" ]; then
  echo "${YELLOW}📋 Copying to Capacitor Android...${NC}"
  npx cap copy android
  echo "${GREEN}✅ Copied to Android!${NC}"

  echo ""
  echo "${GREEN}🎉 Mobile build complete!${NC}"
  echo ""
  echo "To open in Android Studio:"
  echo "  npx cap open android"
  echo ""
  echo "To run on connected device/emulator:"
  echo "  npx cap run android"
else
  echo "${YELLOW}⚠️ Android platform not added yet.${NC}"
  echo "Run: npx cap add android"
  echo "Then run this script again."
fi

echo ""
echo "${GREEN}Done! 🚀${NC}"
