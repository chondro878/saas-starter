# Troubleshooting: "Failed to Load Recipients" Error

## ✅ Issue Resolved

The "Failed to load recipients - Internal server error" issue has been diagnosed and fixed.

## Root Cause

The error occurred because the database was missing required columns from the "Just Because" feature migration:
- `is_just_because` 
- `computed_send_date`
- `card_variation`
- `last_sent_year`

When the API tried to query the `occasions` table, it looked for these columns that didn't exist, causing a PostgreSQL error and returning a 500 Internal Server Error to the frontend.

## The Fix

**Migration 0006** was run to add all missing "Just Because" columns to the database:

```bash
# The migration that was applied:
lib/db/migrations/0006_add_just_because_fields.sql
```

All 4 columns were successfully added, and the recipients now load correctly.

## Prevention: Database Health Check

To prevent this from happening again, a new health check script has been added:

### **Run the Health Check:**

```bash
npm run db:check
```

This script:
- ✅ Verifies database connection
- ✅ Checks all required tables exist
- ✅ Validates all required columns are present
- ✅ Reports missing columns with clear action items
- ✅ Exits with error code 1 if issues found (CI/CD compatible)

### **When to Run:**

1. **After pulling code changes** that include schema updates
2. **Before deploying** to production
3. **When experiencing database errors**
4. **As part of CI/CD pipeline** (add to GitHub Actions)

## How to Diagnose Database Errors

### 1. Check Server Logs
Look for detailed error messages in your terminal where `npm run dev` is running.

### 2. Run Health Check
```bash
npm run db:check
```

### 3. Check API Response
Use browser DevTools → Network tab → Check `/api/recipients` response for detailed error message.

### 4. Verify Database Connection
```bash
# Test connection
psql $DATABASE_URL -c "SELECT current_database();"
```

## Common Causes & Solutions

### **Missing Database Columns**
**Symptom:** 500 error, console shows "column does not exist"  
**Solution:**
```bash
npm run db:check  # Identify missing columns
# Then run the appropriate migration file
```

### **Database Connection Failed**
**Symptom:** ECONNREFUSED, "could not connect to server"  
**Solution:**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql
# Start if needed
brew services start postgresql
```

### **Authentication Issues**
**Symptom:** 401 Unauthorized  
**Solution:**
- Log out and log back in
- Clear browser cookies
- Check Supabase connection in `.env`

### **Schema Mismatch**
**Symptom:** Drizzle errors about type mismatches  
**Solution:**
```bash
# Regenerate Drizzle schema
npm run db:generate
```

## Migration Checklist

When adding new features that require database changes:

- [ ] Create migration SQL file in `lib/db/migrations/`
- [ ] Update `lib/db/schema.ts` with new columns
- [ ] Run migration on local database
- [ ] Run `npm run db:check` to verify
- [ ] Test API endpoints that use the new columns
- [ ] Document migration in git commit
- [ ] Run migration on production database before deploying code

## Production Deployment

**CRITICAL:** Always run migrations BEFORE deploying code that uses new columns:

1. **Connect to production database**
2. **Backup database** (just in case)
3. **Run migration SQL** against production
4. **Verify with health check**
5. **Deploy new code**

Never deploy code that expects columns that don't exist yet!

## Monitoring

Add these to your monitoring/alerting:

- API error rates for `/api/recipients`
- Database connection pool exhaustion
- Query timeouts
- Missing column errors

## Quick Commands Reference

```bash
# Health check
npm run db:check

# View database schema
npm run db:studio

# Generate migration from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Check running database
ps aux | grep postgres

# Check running dev servers
ps aux | grep "next dev"
```

## Status: ✅ FIXED

The recipients API is now working correctly. All 9 recipients load successfully with no errors.

**Last verified:** November 29, 2025  
**Fix applied:** Migration 0006 (Just Because fields)  
**Health check:** PASSED

