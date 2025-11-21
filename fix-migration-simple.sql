-- SQL script to clean up partial migration state
-- This can be executed directly in the database

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

-- Show remaining tables and types
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e';
