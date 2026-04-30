#!/bin/bash
export PATH="$HOME/.local/node/v25.9.0/bin:$PATH"
cd /home/z/my-project

# Install dependencies if needed
bun install

# Push database schema
bun run db:push 2>/dev/null || true

# Start dev server (Turbopack mode, which works with Node v25)
exec bun run dev
