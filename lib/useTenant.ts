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
        // Get current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error('useTenant: Not authenticated', userError)
          setError('Not authenticated')
          setLoading(false)
          return
        }

        console.log('useTenant: Current user:', user.email, 'ID:', user.id)

        // Query Supabase directly to get user's tenant_id
        // (The salesforce_tenants table should have a user_id column)
        const { data, error: tenantError } = await supabase
          .from('salesforce_tenants')
          .select('tenant_id')
          .eq('user_id', user.id)
          .maybeSingle()

        console.log('useTenant: Query result:', { data, error: tenantError })

        if (tenantError) {
          console.error('Failed to fetch tenant:', tenantError)
          setError(tenantError.message)
        } else if (data) {
          console.log('useTenant: Found tenant_id:', data.tenant_id)
          setTenantId(data.tenant_id)
        } else {
          // User has no tenant connected yet
          console.log('useTenant: No tenant found for user')
          setTenantId(null)
        }
      } catch (err: any) {
        console.error('Tenant fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserTenant()
  }, [])

  return {
    tenantId,
    loading,
    error,
    hasTenant: !!tenantId
  }
}
