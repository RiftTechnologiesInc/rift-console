import Card from '@/components/Card'

export default function WorkflowsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
        <p className="text-gray-600 mt-2">Automated workflow management</p>
      </div>

      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Workflow Automation Coming Soon
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Automated workflows for client onboarding, data synchronization, and process
            management will be available here.
          </p>
        </div>
      </Card>
    </div>
  )
}
