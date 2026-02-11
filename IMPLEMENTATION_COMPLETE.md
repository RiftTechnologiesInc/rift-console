# Multi-Tenancy Fix - Implementation Complete

## ✅ All Code Changes Implemented

### Frontend Changes (rift-console)

**1. Created `lib/useTenant.ts`** - React hook to get current user's tenant
- Queries `salesforce_tenants` table filtered by user_id
- Returns tenantId, loading state, and hasTenant boolean

**2. Updated `app/(protected)/dashboard/page.tsx`**
- Now uses `useTenant()` hook instead of hardcoded tenant_id
- Redirects to `/connect-salesforce` if user has no tenant
- Fetches data using dynamic tenant_id

**3. Updated `app/(protected)/clients/page.tsx`**
- Now uses `useTenant()` hook instead of hardcoded tenant_id
- Redirects to `/connect-salesforce` if user has no tenant
- Fetches clients using dynamic tenant_id

**4. Updated `app/(protected)/integrations/page.tsx`**
- Queries `salesforce_tenants` table filtered by current user
- Shows only the logged-in user's Salesforce connections
- No longer shows seed data from old `integrations` table

**5. Updated `app/(protected)/connect-salesforce/page.tsx`**
- Gets current user's ID from Supabase auth
- Passes `userId` query parameter to backend OAuth endpoint

### Backend Changes (rift-integrations)

**1. Updated `TenantConnection` type** (line ~77)
- Added optional `userId?: string` field

**2. Updated `upsertTenant()` function** (line ~229)
- Now stores `user_id` column when upserting to `salesforce_tenants`

**3. Updated `/oauth/salesforce/start` endpoint** (line ~438)
- Accepts `userId` query parameter (now required)
- Stores userId in OAuth state along with tenantId and loginUrl

**4. Updated `/oauth/salesforce/callback` endpoint** (line ~475)
- Extracts `userId` from OAuth state
- Passes userId to `upsertTenant()` to store in database

## ⚠️ Required Manual Steps

### Step 1: Run Database Migration

In **Supabase SQL Editor**, run:

```sql
-- Add user_id column to salesforce_tenants table
ALTER TABLE salesforce_tenants
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_salesforce_tenants_user_id
ON salesforce_tenants(user_id);
```

Or run the file: `migrations/add_user_id_to_salesforce_tenants.sql`

### Step 2: Link Existing Tenant to Correct User

If you have an existing tenant connection, link it to the correct user:

```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'repo@riftira.com';

-- Copy the UUID from the result, then update the tenant
UPDATE salesforce_tenants
SET user_id = 'PASTE_USER_ID_HERE'
WHERE tenant_id = '25323fc0-fa21-41c0-b899-343b8eaa16a0';

-- Verify the update
SELECT tenant_id, user_id FROM salesforce_tenants;
```

### Step 3: Restart Backend Server

The backend code was modified, so you need to restart it:

```bash
# In rift-integrations directory
# Stop the current server (Ctrl+C)
npm run api:dev
```

### Step 4: Test the Fix

**Test 1: New User Flow**
1. Create a new test user in Supabase:
   - Email: `test@example.com`
   - Password: `password123`

2. Log in to Rift Console with this new user

3. **Expected**: You should be redirected to `/connect-salesforce` page
   - Dashboard should NOT show data from other tenants
   - No clients, no integrations should be visible yet

4. Click "Connect Salesforce", enter a tenant ID, and complete OAuth

5. **Expected**: After OAuth, you should see only this user's Salesforce data

**Test 2: Existing User (repo@riftira.com)**
1. Log out and log back in as `repo@riftira.com`

2. **Expected**: Should see the existing tenant's data (if you ran Step 2 to link it)

**Test 3: Isolation**
1. Log in as different users

2. **Expected**: Each user should only see their own Salesforce data
   - No cross-tenant data visibility
   - New users see "Connect Salesforce" prompt
   - Connected users see only their data

## Files Modified

### rift-console (Frontend)
- ✅ `lib/useTenant.ts` (NEW)
- ✅ `app/(protected)/dashboard/page.tsx`
- ✅ `app/(protected)/clients/page.tsx`
- ✅ `app/(protected)/integrations/page.tsx`
- ✅ `app/(protected)/connect-salesforce/page.tsx`

### rift-integrations (Backend)
- ✅ `src/api/server.ts`
  - `TenantConnection` type (added userId field)
  - `upsertTenant()` function (stores user_id)
  - `/oauth/salesforce/start` endpoint (accepts & stores userId)
  - `/oauth/salesforce/callback` endpoint (extracts userId from state)

### Database
- ⚠️ `salesforce_tenants` table - Needs migration (see Step 1)

## Verification Checklist

After completing manual steps:

- [ ] Database migration ran successfully
- [ ] Existing tenant linked to correct user (if applicable)
- [ ] Backend server restarted
- [ ] New user redirects to "Connect Salesforce" page
- [ ] New user can complete OAuth flow
- [ ] New user sees only their Salesforce data after connecting
- [ ] Existing user sees only their Salesforce data
- [ ] No cross-tenant data leakage

## Security Notes

**Optional**: Enable Row Level Security (RLS) on salesforce_tenants table:

```sql
-- Enable RLS
ALTER TABLE salesforce_tenants ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tenants
CREATE POLICY "Users can view own tenants"
ON salesforce_tenants FOR SELECT
USING (auth.uid() = user_id);

-- Users can only update their own tenants
CREATE POLICY "Users can update own tenants"
ON salesforce_tenants FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert tenants for themselves
CREATE POLICY "Users can insert own tenants"
ON salesforce_tenants FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

This provides an additional security layer beyond application-level filtering.

## Rollback Instructions

If you need to revert these changes:

**Database:**
```sql
ALTER TABLE salesforce_tenants DROP COLUMN user_id;
```

**Code:**
```bash
# In both repositories
git checkout HEAD -- .
```

Then restart both servers.

## Next Steps

Once testing is complete and multi-tenancy is working:

1. Update ONBOARDING.md to reflect the new flow
2. Remove hardcoded API keys from frontend code
3. Consider implementing API key per user instead of shared key
4. Add tenant management UI (view/disconnect tenants)
5. Add audit logging for tenant connections

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs for OAuth errors
3. Verify database migration ran successfully
4. Confirm user_id is being stored in salesforce_tenants table
5. Test with a completely fresh user account

All code changes are now complete. Follow the manual steps above to activate the multi-tenancy fix.
