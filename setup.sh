#!/usr/bin/env bash
set -e

echo ""
echo "============================================"
echo "  Smart Job Applier — Setup Script"
echo "============================================"
echo ""

# Check Node version
NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js 18 or higher is required."
  echo "Download it from https://nodejs.org"
  exit 1
fi
echo "Node.js $(node -v) detected."

# Install root deps
echo ""
echo "Installing root dependencies..."
npm install

# Install server deps
echo ""
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install client deps
echo ""
echo "Installing client dependencies..."
cd client
npm install
cd ..

# Copy env files if not present
echo ""
if [ ! -f server/.env ]; then
  cp server/.env.example server/.env
  echo "Created server/.env from .env.example"
  echo "ACTION REQUIRED: Open server/.env and fill in your API keys."
else
  echo "server/.env already exists — skipping."
fi

if [ ! -f client/.env ]; then
  cp client/.env.example client/.env
  echo "Created client/.env from .env.example"
else
  echo "client/.env already exists — skipping."
fi

echo ""
echo "============================================"
echo "  Setup complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Edit server/.env and add your API keys"
echo "  2. Run: npm run dev"
echo ""
echo "App will be available at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:5000"
echo ""
