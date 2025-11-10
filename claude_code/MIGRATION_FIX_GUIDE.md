# Prisma Migration Fix Guide

## Problem
The migration `20251109163933_init` failed because enum types already existed in the database. The migration partially applied, creating the enums but failing before completing the rest of the schema.

**Error:** `type "SubscriptionTier" already exists` (PostgreSQL error code 42710)

## Root Cause
- The database already had the enum types (`SubscriptionTier`, `SubscriptionStatus`, `EventStatus`) from a previous migration attempt
- When the migration tried to create them again, it failed
- Prisma marked the migration as failed in the `_prisma_migrations` table
- Prisma won't apply any migrations until the failed one is resolved

## Solutions

### Option 1: Automated Fix Script (Recommended)
Run the fix script inside the Docker container:

```bash
# From your host machine
docker exec -it mf_app sh

# Inside the container
chmod +x fix-migration.sh
./fix-migration.sh
```

### Option 2: Manual Fix (Step by Step)
If you prefer to do it manually:

#### Step 1: Mark the migration as rolled back
```bash
docker exec -it mf_app npx prisma migrate resolve --rolled-back "20251109163933_init"
```

#### Step 2: Clean up the database
Access the database:
```bash
docker exec -it mf_database psql -U postgres -d mentor_futuro
```

Then run the cleanup SQL:
```sql
-- Drop all tables (in correct order)
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "course_enrollments" CASCADE;
DROP TABLE IF EXISTS "course_modules" CASCADE;
DROP TABLE IF EXISTS "courses" CASCADE;
DROP TABLE IF EXISTS "event_registrations" CASCADE;
DROP TABLE IF EXISTS "events" CASCADE;
DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop enum types
DROP TYPE IF EXISTS "EventStatus" CASCADE;
DROP TYPE IF EXISTS "SubscriptionStatus" CASCADE;
DROP TYPE IF EXISTS "SubscriptionTier" CASCADE;

-- Exit psql
\q
```

#### Step 3: Reapply the migration
```bash
docker exec -it mf_app npx prisma migrate deploy
```

### Option 3: Using Adminer (GUI)
1. Open Adminer at http://localhost:8080
2. Login with:
   - System: PostgreSQL
   - Server: db
   - Username: postgres
   - Password: postgres
   - Database: mentor_futuro
3. Execute the SQL from `fix-migration-simple.sql`
4. Run `docker exec -it mf_app npx prisma migrate resolve --rolled-back "20251109163933_init"`
5. Run `docker exec -it mf_app npx prisma migrate deploy`

### Option 4: Nuclear Option (Fresh Start)
If you don't need to preserve any data:

```bash
# Stop and remove containers
docker-compose down -v

# Remove the postgres volume (this deletes all data!)
docker volume rm mf_app_postgres_data

# Start fresh
docker-compose up -d
```

The migration will run automatically as part of the app startup command.

## Verification
After applying the fix, verify the migration status:

```bash
docker exec -it mf_app npx prisma migrate status
```

You should see:
```
Database schema is up to date!
```

## Prevention
To avoid this issue in the future:
1. Always use `prisma migrate dev` in development (not `prisma migrate deploy`)
2. If a migration fails, resolve it immediately before attempting new migrations
3. Consider using `prisma db push` for rapid prototyping in development
4. In production, always backup your database before running migrations

## Additional Resources
- [Prisma Migration Troubleshooting](https://www.prisma.io/docs/guides/database/production-troubleshooting)
- [Prisma Migrate Resolve](https://www.prisma.io/docs/reference/api-reference/command-reference#migrate-resolve)
