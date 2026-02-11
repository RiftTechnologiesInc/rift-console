'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTenant } from '@/lib/useTenant'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import EmptyState from '@/components/EmptyState'
import { getStatusVariant } from '@/lib/utils'

export default function ClientsPage() {
  const router = useRouter()
  const { tenantId, loading: tenantLoading, hasTenant } = useTenant()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect to connect page if user has no tenant
  useEffect(() => {
    if (!tenantLoading && !hasTenant) {
      router.push('/connect-salesforce')
    }
  }, [tenantLoading, hasTenant, router])

  useEffect(() => {
    if (!tenantId) return // Wait for tenant to load

    async function fetchClients() {
      try {
        // Query backend API which fetches from Salesforce
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3001'

        const response = await fetch(`${backendUrl}/clients`, {
          headers: {
            'x-api-key': 'pgsf/7JPlPoOdKPHx+/EMxmxjjxDuk8jPhfwSAiqTTM=',
            'x-tenant-id': tenantId as string
          }
        })

        if (!response.ok) throw new Error('Failed to fetch clients')
        const data = await response.json()

        // Transform Salesforce data to match UI format
        const transformedClients = data.map((client: any) => ({
          id: client.id,
          first_name: client.name.split(' ')[0] || client.name,
          last_name: client.name.split(' ').slice(1).join(' ') || '',
          email: client.email || 'N/A',
          status: 'active',
          advisors: null
        }))

        setClients(transformedClients)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [tenantId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading clients...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">Failed to load clients: {error}</p>
      </div>
    )
  }

  const clientCount = clients?.length ?? 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clients ({clientCount})</h1>
        <p className="text-gray-600 mt-2">Client portfolio and details</p>
      </div>

      <Card>
        {!clients || clients.length === 0 ? (
          <EmptyState
            icon="🧑‍💼"
            title="No clients found"
            description="Start adding clients to your portfolio"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Advisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link href={`/clients/${client.id}`} className="text-blue-600 hover:text-blue-800">
                        {client.first_name} {client.last_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.advisors
                        ? `${client.advisors.first_name} ${client.advisors.last_name}`
                        : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge variant={getStatusVariant(client.status)}>
                        {client.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
