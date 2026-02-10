import React from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  )
}
