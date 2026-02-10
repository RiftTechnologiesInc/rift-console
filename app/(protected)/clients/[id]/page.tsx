'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import { formatDateTime, getStatusVariant } from '@/lib/utils'

export default function ClientDetailPage() {
  const params = useParams()
  const clientId = params.id as string

  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchClient() {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*, advisors(*)')
          .eq('id', clientId)
          .single()

        if (error) throw error
        setClient(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (clientId) {
      fetchClient()
    }
  }, [clientId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading client details...</div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div>
        <Link href="/clients" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Clients
        </Link>
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">Client not found</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <Link href="/clients" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back to Clients
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {client.first_name} {client.last_name}
        </h1>
        <p className="text-gray-600 mt-2">Client details and information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Contact Information">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-gray-900">{client.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
              <p className="text-gray-900">{client.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <div>
                <Badge variant={getStatusVariant(client.status)}>{client.status}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Advisor Information">
          {client.advisors ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                <p className="text-gray-900">
                  {client.advisors.first_name} {client.advisors.last_name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{client.advisors.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <p className="text-gray-900">{client.advisors.phone || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No advisor assigned</p>
          )}
        </Card>

        <Card title="System Information">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">External ID</label>
              <p className="text-gray-900 font-mono text-sm">{client.external_id || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
              <p className="text-gray-900">{formatDateTime(client.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
              <p className="text-gray-900">{formatDateTime(client.updated_at)}</p>
            </div>
          </div>
        </Card>

        <Card title="Metadata">
          {client.metadata && Object.keys(client.metadata).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(client.metadata as Record<string, any>).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
                  <p className="text-gray-900 text-sm">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No additional metadata</p>
          )}
        </Card>
      </div>
    </div>
  )
}
