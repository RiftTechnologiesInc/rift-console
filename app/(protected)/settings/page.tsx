import { getUser } from '@/lib/auth'
import Card from '@/components/Card'

export default async function SettingsPage() {
  const user = await getUser()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Application configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="User Information">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-gray-900">{user?.email || 'Not available'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">User ID</label>
              <p className="text-gray-900 font-mono text-sm">{user?.id || 'Not available'}</p>
            </div>
          </div>
        </Card>

        <Card title="Application Settings">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Coming Soon</h3>
            <p className="text-gray-600 text-sm">
              Configuration options for notifications, integrations, and preferences will be
              available here.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
