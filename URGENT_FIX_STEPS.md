# URGENT: Fix Multi-Tenancy Issue

## The Problem

Every user is seeing the same tenant's data because `tenant_id` is hardcoded. New users should see "Connect Salesforce" page, not existing tenant data.

## Quick Fix Steps

### Step 1: Run Database Migration

In **Supabase SQL Editor**, run this SQL:

```sql
-- Add user_id column to link tenants to auth users
ALTER TABLE salesforce_tenants
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_salesforce_tenants_user_id
ON salesforce_tenants(user_id);
```

Or just run the file: `migrations/add_user_id_to_salesforce_tenants.sql`

### Step 2: Link Existing Tenant to User

Find your existing tenant and link it to the correct user:

```sql
-- First, find your user ID
SELECT id, email FROM auth.users;

-- Then update the existing tenant
UPDATE salesforce_tenants
SET user_id = 'YOUR_USER_ID_HERE'
WHERE tenant_id = '25323fc0-fa21-41c0-b899-343b8eaa16a0';

-- Verify
SELECT tenant_id, user_id FROM salesforce_tenants;
```

Replace `YOUR_USER_ID_HERE` with the UUID from the first query for `repo@riftira.com`.

### Step 3: Update Backend OAuth Callback

**File:** `rift-integrations/src/api/routes/oauth.ts` (or wherever the OAuth callback is)

Find the callback handler that stores tokens in `salesforce_tenants` and add `user_id`:

```typescript
// In the OAuth callback endpoint
server.get('/oauth/salesforce/callback', async (request, reply) => {
  const { code, state } = request.query as { code: string; state: string }

  // Parse state to get tenantId AND userId (frontend now sends both)
  const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
  const { tenantId, userId } = stateData

  // ... existing OAuth exchange code ...

  // When upserting to salesforce_tenants, include user_id
  const { error } = await supabase
    .from('salesforce_tenants')
    .upsert({
      tenant_id: tenantId,
      user_id: userId, // <- ADD THIS LINE
      login_url: loginUrl,
      instance_url: instanceUrl,
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      issued_at: issuedAt,
      id_url: idUrl
    }, { onConflict: 'tenant_id' })

  // ... rest of callback logic ...
})

// Also update the /start endpoint to include userId in state
server.get('/oauth/salesforce/start', async (request, reply) => {
  const { tenantId, userId } = request.query as { tenantId: string; userId: string }

  // Store both in state for callback
  const state = Buffer.from(JSON.stringify({ tenantId, userId })).toString('base64')

  // ... rest of OAuth start logic with state ...
})
```

### Step 4: Enable RLS on salesforce_tenants (Security)

In **Supabase SQL Editor**:

```sql
-- Enable Row Level Security
ALTER TABLE salesforce_tenants ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tenants
CREATE POLICY "Users can view own tenants"
ON salesforce_tenants
FOR SELECT
USING (auth.uid() = user_id);

-- Users can only update their own tenants
CREATE POLICY "Users can update own tenants"
ON salesforce_tenants
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert tenants for themselves
CREATE POLICY "Users can insert own tenants"
ON salesforce_tenants
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Step 5: Test the Fix

1. **Log out** of Rift Console
2. **Create a new test user** in Supabase:
   - Email: `test@example.com`
   - Password: `password123`
3. **Log in** with the new user
4. **Expected result**: Should redirect to "Connect Salesforce" page (NO data shown)
5. **Click "Connect Salesforce"** and authorize
6. **Expected result**: After OAuth, should see only this new user's Salesforce data

### Step 6: Verify Isolation

1. Log in as `repo@riftira.com` → Should see original tenant's data
2. Log in as `contact@riftira.com` → Should see their own tenant's data (or Connect page if they haven't connected)
3. Each user should ONLY see their own Salesforce org's data

## Files Changed (Already Done)

✅ Created `lib/useTenant.ts` - Hook to get current user's tenant_id
✅ Updated `app/(protected)/connect-salesforce/page.tsx` - Now passes user_id to backend
✅ Created migration SQL file

## Files You Need to Change (Backend)

❌ `rift-integrations/src/api/routes/oauth.ts` (or wherever OAuth handlers are)
   - Update `/oauth/salesforce/start` to accept `userId` query param
   - Store `userId` in OAuth state
   - Update `/oauth/salesforce/callback` to extract `userId` from state
   - Include `user_id` when upserting to `salesforce_tenants`

## Next Steps (Once Backend is Updated)

After updating the backend, you can update the frontend pages to use `useTenant()` hook instead of hardcoded tenant_id:

1. Update `app/(protected)/dashboard/page.tsx`
2. Update `app/(protected)/clients/page.tsx`
3. Update `app/(protected)/integrations/page.tsx`

See `FIX_MULTITENANT.md` for detailed examples of how to use the `useTenant()` hook in each page.

## Why This Fixes the Issue

**Before:**
- All users → hardcoded `tenant_id` → same Salesforce data

**After:**
- User logs in → get their `user.id`
- Query `salesforce_tenants WHERE user_id = user.id`
- Get their specific `tenant_id`
- Query backend with their `tenant_id`
- See only their Salesforce data

## Rollback Plan

If something breaks:

```sql
-- Remove the column (doesn't delete data)
ALTER TABLE salesforce_tenants DROP COLUMN user_id;

-- Disable RLS
ALTER TABLE salesforce_tenants DISABLE ROW LEVEL SECURITY;

-- Drop policies
DROP POLICY IF EXISTS "Users can view own tenants" ON salesforce_tenants;
DROP POLICY IF EXISTS "Users can update own tenants" ON salesforce_tenants;
DROP POLICY IF EXISTS "Users can insert own tenants" ON salesforce_tenants;
```

Then revert the code changes.
