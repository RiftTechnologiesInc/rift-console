'use client'

import { useState } from 'react'
import Card from '@/components/Card'

export default function ConnectSalesforcePage() {
  const [tenantId, setTenantId] = useState('')
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    if (!tenantId.trim()) {
      alert('Please enter a Tenant ID')
      return
    }

    setConnecting(true)

    // Redirect to backend OAuth start endpoint
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3000'
    window.location.href = `${backendUrl}/oauth/salesforce/start?tenantId=${encodeURIComponent(tenantId.trim())}`
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Connect Salesforce</h1>
        <p className="text-gray-600 mt-2">Connect a new Salesforce organization to Rift</p>
      </div>

      <Card>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              New Salesforce Connection
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter a unique Tenant ID for this firm, then authorize their Salesforce organization.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenant ID
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., acme-financial or firm_123"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              disabled={connecting}
            />
            <p className="text-xs text-gray-500 mt-1">
              This ID will be used to identify this firm's data. Use a slug (acme-financial) or UUID.
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={connecting || !tenantId.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting ? 'Redirecting to Salesforce...' : 'Connect Salesforce'}
          </button>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Make sure your ngrok tunnel is running and the backend API server is started before connecting.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Connected Tenants" className="mt-6">
        <p className="text-sm text-gray-500">
          After connecting, the tenant will appear in your Integrations page.
        </p>
      </Card>
    </div>
  )
}
