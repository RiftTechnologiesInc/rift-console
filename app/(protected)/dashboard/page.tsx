'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import { formatRelativeTime } from '@/lib/utils'

type DashboardData = {
  tenant: any
  advisorCount: number
  clientCount: number
  integrationCount: number
  lastSyncTime: string
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3001'
        const tenantId = '25323fc0-fa21-41c0-b899-343b8eaa16a0' // TODO: Get from auth context
        const apiKey = 'pgsf/7JPlPoOdKPHx+/EMxmxjjxDuk8jPhfwSAiqTTM='

        // Fetch tenant info from Salesforce API
        const tenantInfoResponse = await fetch(`${backendUrl}/tenants/${tenantId}/info`, {
          headers: {
            'x-api-key': apiKey,
            'x-tenant-id': tenantId
          }
        })

        const tenantInfo = tenantInfoResponse.ok ? await tenantInfoResponse.json() : null

        // Fetch clients from Salesforce
        const clientsResponse = await fetch(`${backendUrl}/clients`, {
          headers: {
            'x-api-key': apiKey,
            'x-tenant-id': tenantId
          }
        })

        const clients = clientsResponse.ok ? await clientsResponse.json() : []

        // Fetch service requests
        const srResponse = await fetch(`${backendUrl}/service-requests`, {
          headers: {
            'x-api-key': apiKey,
            'x-tenant-id': tenantId
          }
        })

        const serviceRequests = srResponse.ok ? await srResponse.json() : []

        setData({
          tenant: { name: 'Rift IRA' },
          advisorCount: 0, // Salesforce doesn't have advisors - this is a Rift concept
          clientCount: clients.length,
          integrationCount: 1, // This tenant has 1 Salesforce integration
          lastSyncTime: tenantInfo?.issuedAt ? formatRelativeTime(tenantInfo.issuedAt) : 'Just now',
        })
      } catch (err: any) {
        console.error('Dashboard fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">Failed to load dashboard: {error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard {data?.tenant?.name ? `- ${data.tenant.name}` : ''}
        </h1>
        <p className="text-gray-600 mt-2">Overview of your system status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Advisors" value={data?.advisorCount ?? 0} icon="👥" />
        <StatCard label="Clients" value={data?.clientCount ?? 0} icon="🧑‍💼" />
        <StatCard label="Integrations" value={data?.integrationCount ?? 0} icon="🔗" />
        <StatCard label="Last Sync" value={data?.lastSyncTime ?? 'Never'} icon="🔄" />
      </div>

      {!data?.tenant && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            No tenant configured. Please run the seed data in Supabase SQL Editor.
          </p>
        </div>
      )}
    </div>
  )
}
