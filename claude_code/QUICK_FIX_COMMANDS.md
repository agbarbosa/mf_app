# Quick Fix Commands for Migration Error

## Fastest Solution (Recommended)

Run these commands in order:

```bash
# 1. Mark the failed migration as rolled back
docker exec -it mf_app npx prisma migrate resolve --rolled-back "20251109163933_init"

# 2. Clean up the database using the SQL script
docker exec -i mf_database psql -U postgres -d mentor_futuro < fix-migration-simple.sql

# 3. Reapply the migration
docker exec -it mf_app npx prisma migrate deploy

# 4. Verify it worked
docker exec -it mf_app npx prisma migrate status
```

## Alternative: Using the Shell Script

```bash
# Copy the fix script into the container
docker cp fix-migration.sh mf_app:/app/fix-migration.sh

# Make it executable and run it
docker exec -it mf_app sh -c "chmod +x /app/fix-migration.sh && /app/fix-migration.sh"

# Verify
docker exec -it mf_app npx prisma migrate status
```

## Nuclear Option (If You Don't Need Existing Data)

```bash
# This will delete ALL data and start fresh
docker-compose down -v
docker-compose up -d
```

## Expected Output After Fix

You should see:
```
PostgreSQL database "mentor_futuro", schema "public" at "db:5432"

Database schema is up to date!
```

## Troubleshooting

If you still see errors:
1. Check the app logs: `docker logs mf_app`
2. Check the database logs: `docker logs mf_database`
3. Verify database connection: `docker exec -it mf_database psql -U postgres -d mentor_futuro -c "\dt"`
