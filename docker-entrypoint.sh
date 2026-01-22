#!/bin/bash
set -e

# Verify DATABASE_URL exists
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set!"
  exit 1
fi

echo "🔹 Running Prisma migrations..."
npx prisma migrate deploy

echo "🔹 Seeding database..."
# Adjust path if your seed file is compiled
if [ -f dist/database/seed.js ]; then
  node dist/database/seed.js
else
  echo "⚠️ Seed file not found, skipping..."
fi

echo "🚀 Starting NestJS app..."
exec node dist/main.js
