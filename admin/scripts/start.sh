#!/bin/sh

# Check if .next directory exists
if [ ! -d ".next" ]; then
  echo "Error: .next directory not found. Please run 'npm run build' first."
  exit 1
fi

# Start Next.js server
exec next start -p ${PORT:-3000}
