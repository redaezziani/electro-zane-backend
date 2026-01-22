#!/bin/bash
set -e

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set!"
  exit 1
fi

echo "🔹 Running Prisma migrations..."
npx prisma migrate deploy

echo "🔹 Seeding database..."
# Adjust this path if your seed file is compiled to dist
if [ -f dist/database/seed.js ]; then
  node dist/database/seed.js
else
  echo "⚠️ Seed file not found, skipping..."
fi

echo "🚀 Starting NestJS app..."
exec node dist/main.js
