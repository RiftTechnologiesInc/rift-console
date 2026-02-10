import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: string
}

export default function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        {icon && <div className="text-4xl">{icon}</div>}
      </div>
    </div>
  )
}
