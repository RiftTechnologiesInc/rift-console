-- =====================================================
-- COMPLETE MULTI-TENANT SETUP FOR SALESFORCE_TENANTS
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- Step 1: Add user_id column if it doesn't exist
ALTER TABLE salesforce_tenants
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_salesforce_tenants_user_id
ON salesforce_tenants(user_id);

-- Step 3: Disable Row Level Security (RLS) for now
-- This prevents blocking queries while testing
ALTER TABLE salesforce_tenants DISABLE ROW LEVEL SECURITY;

-- Step 4: Drop any existing policies (clean slate)
DROP POLICY IF EXISTS "Users can view own tenants" ON salesforce_tenants;
DROP POLICY IF EXISTS "Users can update own tenants" ON salesforce_tenants;
DROP POLICY IF EXISTS "Users can insert own tenants" ON salesforce_tenants;
DROP POLICY IF EXISTS "Users can delete own tenants" ON salesforce_tenants;

-- Step 5: Link existing tenants to correct users
-- This updates based on the emails in your database

-- Link repo@riftira.com to the old tenant
UPDATE salesforce_tenants
SET user_id = (SELECT id FROM auth.users WHERE email = 'repo@riftira.com')
WHERE tenant_id = '25323fc0-fa21-41c0-b899-343b8eaa16a0'
  AND user_id IS NULL;

-- Link contact@riftira.com to the new tenant
UPDATE salesforce_tenants
SET user_id = (SELECT id FROM auth.users WHERE email = 'contact@riftira.com')
WHERE tenant_id = '00DgL00000KKsVN'
  AND user_id IS NULL;

-- Step 6: Verify the setup
-- This will show you all tenants with their linked users
SELECT
  st.tenant_id,
  st.user_id,
  au.email as user_email,
  st.instance_url,
  st.issued_at
FROM salesforce_tenants st
LEFT JOIN auth.users au ON st.user_id = au.id
ORDER BY st.issued_at DESC;

-- =====================================================
-- OPTIONAL: Enable RLS with proper policies
-- Uncomment the section below if you want to enable RLS
-- =====================================================

/*
-- Enable RLS
ALTER TABLE salesforce_tenants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tenants
CREATE POLICY "Users can view own tenants"
ON salesforce_tenants
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert tenants for themselves
CREATE POLICY "Users can insert own tenants"
ON salesforce_tenants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tenants
CREATE POLICY "Users can update own tenants"
ON salesforce_tenants
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own tenants
CREATE POLICY "Users can delete own tenants"
ON salesforce_tenants
FOR DELETE
USING (auth.uid() = user_id);
*/

-- =====================================================
-- VERIFICATION QUERIES
-- Run these separately to check everything is working
-- =====================================================

-- Check if RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'salesforce_tenants';

-- See all policies
-- SELECT * FROM pg_policies WHERE tablename = 'salesforce_tenants';

-- Count tenants per user
-- SELECT au.email, COUNT(st.tenant_id) as tenant_count
-- FROM auth.users au
-- LEFT JOIN salesforce_tenants st ON au.id = st.user_id
-- GROUP BY au.email;
