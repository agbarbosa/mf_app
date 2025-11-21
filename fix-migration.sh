#!/bin/bash
# Script to fix the failed Prisma migration
# This should be run inside the Docker container

set -e

echo "🔧 Fixing failed Prisma migration..."
echo ""

# Step 1: Mark the failed migration as rolled back
echo "Step 1: Marking failed migration as rolled back..."
npx prisma migrate resolve --rolled-back "20251109163933_init"
echo "✅ Migration marked as rolled back"
echo ""

# Step 2: Clean up partial database state using SQL
echo "Step 2: Cleaning up partial database state..."
PGPASSWORD=postgres psql -h db -U postgres -d mentor_futuro << 'EOF'
-- Drop all tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "course_enrollments" CASCADE;
DROP TABLE IF EXISTS "course_modules" CASCADE;
DROP TABLE IF EXISTS "courses" CASCADE;
DROP TABLE IF EXISTS "event_registrations" CASCADE;
DROP TABLE IF EXISTS "events" CASCADE;
DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop enum types if they exist
DROP TYPE IF EXISTS "EventStatus" CASCADE;
DROP TYPE IF EXISTS "SubscriptionStatus" CASCADE;
DROP TYPE IF EXISTS "SubscriptionTier" CASCADE;

-- Verify cleanup
\dt
\dT
EOF
echo "✅ Database cleaned up"
echo ""

# Step 3: Deploy migrations
echo "Step 3: Deploying migrations..."
npx prisma migrate deploy
echo "✅ Migrations deployed successfully"
echo ""

echo "🎉 Migration fix complete!"
