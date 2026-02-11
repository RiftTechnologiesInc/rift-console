# Multi-Tenant Bug Fix

## Problem

Currently, every Supabase user sees the same Salesforce tenant's data because the `tenant_id` is hardcoded in the frontend.

## Root Cause

1. `salesforce_tenants` table has no link to Supabase auth users
2. Frontend code uses: `const tenantId = '25323fc0-fa21-41c0-b899-343b8eaa16a0'`
3. No way to know which tenant belongs to which user

## Solution

### Step 1: Add `user_id` Column to Database

Run this SQL in Supabase SQL Editor:

```sql
-- Add user_id column to salesforce_tenants table
ALTER TABLE salesforce_tenants
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create index for fast lookups
CREATE INDEX idx_salesforce_tenants_user_id ON salesforce_tenants(user_id);

-- Make user_id NOT NULL for new rows (existing rows can be null until fixed)
-- ALTER TABLE salesforce_tenants ALTER COLUMN user_id SET NOT NULL;
```

### Step 2: Update OAuth Callback in Backend

The backend OAuth callback needs to store the `user_id` when a tenant connects.

**File:** `rift-integrations/src/api/server.ts` (OAuth callback endpoint)

When storing OAuth tokens in `salesforce_tenants`, include the `user_id`:

```typescript
// In OAuth callback after successful authorization
const { error } = await supabase
  .from('salesforce_tenants')
  .upsert({
    tenant_id: tenantId,
    user_id: userId, // <- ADD THIS from JWT token or session
    login_url: loginUrl,
    instance_url: instanceUrl,
    access_token: encryptedAccessToken,
    refresh_token: encryptedRefreshToken,
    issued_at: issuedAt,
    id_url: idUrl
  }, { onConflict: 'tenant_id' })
```

The `userId` should come from the authenticated session. The frontend needs to pass it.

### Step 3: Pass User ID from Frontend to OAuth Flow

**File:** `rift-console/app/(protected)/connect-salesforce/page.tsx`

Modify the OAuth redirect to include the user's ID:

```typescript
const handleConnect = async () => {
  if (!tenantId.trim()) {
    alert('Please enter a Tenant ID')
    return
  }

  setConnecting(true)

  // Get current user's ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    alert('Not authenticated')
    return
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3001'

  // Pass user ID to backend so it can associate the tenant with this user
  window.location.href = `${backendUrl}/oauth/salesforce/start?tenantId=${encodeURIComponent(tenantId.trim())}&userId=${user.id}`
}
```

### Step 4: Create Tenant Context Hook

**File:** `rift-console/lib/useTenant.ts` (NEW FILE)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useTenant() {
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserTenant() {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          setError('Not authenticated')
          setLoading(false)
          return
        }

        // Query backend to get user's tenant_id
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3001'
        const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'pgsf/7JPlPoOdKPHx+/EMxmxjjxDuk8jPhfwSAiqTTM='

        const response = await fetch(`${backendUrl}/users/${user.id}/tenant`, {
          headers: {
            'x-api-key': apiKey
          }
        })

        if (response.ok) {
          const data = await response.json()
          setTenantId(data.tenant_id)
        } else {
          // User has no tenant connected yet
          setTenantId(null)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserTenant()
  }, [])

  return { tenantId, loading, error, hastenant: !!tenantId }
}
```

### Step 5: Add Backend Endpoint to Get User's Tenant

**File:** `rift-integrations/src/api/server.ts` (ADD NEW ENDPOINT)

```typescript
// Get user's tenant_id
server.get('/users/:userId/tenant', async (request, reply) => {
  const { userId } = request.params as { userId: string }

  const { data, error } = await supabase
    .from('salesforce_tenants')
    .select('tenant_id')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return reply.code(404).send({ error: 'No tenant found for user' })
  }

  return { tenant_id: data.tenant_id }
})
```

### Step 6: Update Dashboard to Use Tenant Hook

**File:** `rift-console/app/(protected)/dashboard/page.tsx`

Replace hardcoded tenant_id with the hook:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTenant } from '@/lib/useTenant'
import StatCard from '@/components/StatCard'
import { formatRelativeTime } from '@/lib/utils'

export default function DashboardPage() {
  const { tenantId, loading: tenantLoading, hasTenanttenant } = useTenant()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect to connect page if no tenant
  useEffect(() => {
    if (!tenantLoading && !hasTenant) {
      router.push('/connect-salesforce')
    }
  }, [tenantLoading, hasTenant, router])

  useEffect(() => {
    if (!tenantId) return // Wait for tenant_id

    async function fetchDashboardData() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3001'
        const apiKey = 'pgsf/7JPlPoOdKPHx+/EMxmxjjxDuk8jPhfwSAiqTTM='

        // Now use dynamic tenantId from hook
        const clientsResponse = await fetch(`${backendUrl}/clients`, {
          headers: {
            'x-api-key': apiKey,
            'x-tenant-id': tenantId // <- Use from hook, not hardcoded
          }
        })

        const clients = clientsResponse.ok ? await clientsResponse.json() : []

        setData({
          tenant: { name: 'Your Firm' },
          clientCount: clients.length,
          // ... rest of data
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [tenantId])

  if (tenantLoading || loading) {
    return <div>Loading...</div>
  }

  // ... rest of component
}
```

### Step 7: Update Other Pages

Apply the same pattern to:
- `app/(protected)/clients/page.tsx`
- `app/(protected)/integrations/page.tsx`
- Any other page that queries backend API

Replace:
```typescript
const tenantId = '25323fc0-fa21-41c0-b899-343b8eaa16a0' // REMOVE
```

With:
```typescript
const { tenantId, hasT hasTenant } = useTenant()

if (!hasTenant) {
  return <div>Please connect Salesforce first</div>
}
```

## Migration for Existing Data

If you already have tenant connections without `user_id`, you need to manually update them:

```sql
-- Find your existing tenant
SELECT * FROM salesforce_tenants;

-- Update it with the correct user_id
UPDATE salesforce_tenants
SET user_id = 'YOUR_SUPABASE_USER_ID'
WHERE tenant_id = '25323fc0-fa21-41c0-b899-343b8eaa16a0';
```

Get the user ID from Supabase Authentication dashboard.

## Summary

After these changes:

1. ✅ Each Supabase auth user links to their own `tenant_id`
2. ✅ New users start with no tenant → redirected to "Connect Salesforce"
3. ✅ OAuth flow stores `user_id` with the tenant
4. ✅ Dashboard/pages load data for the logged-in user's tenant only
5. ✅ Multi-tenancy works correctly
