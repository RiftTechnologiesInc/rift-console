-- Migration: Add user_id to salesforce_tenants for multi-tenancy
-- Run this in Supabase SQL Editor

-- Add user_id column to link tenants to Supabase auth users
ALTER TABLE salesforce_tenants
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for fast tenant lookups by user
CREATE INDEX IF NOT EXISTS idx_salesforce_tenants_user_id
ON salesforce_tenants(user_id);

-- Add comment for documentation
COMMENT ON COLUMN salesforce_tenants.user_id IS 'Links this Salesforce tenant to a Supabase auth user';

-- OPTIONAL: Make user_id required for new rows (uncomment if desired)
-- ALTER TABLE salesforce_tenants ALTER COLUMN user_id SET NOT NULL;

-- Query to verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'salesforce_tenants'
ORDER BY ordinal_position;
