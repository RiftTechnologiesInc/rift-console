'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Integrations', href: '/integrations', icon: '🔗' },
  { name: 'Connect Salesforce', href: '/connect-salesforce', icon: '➕' },
  { name: 'Advisors', href: '/advisors', icon: '👥' },
  { name: 'Clients', href: '/clients', icon: '👤' },
  { name: 'Activity', href: '/activity', icon: '📋' },
  { name: 'Workflows', href: '/workflows', icon: '⚡' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white">
      <div className="flex items-center justify-center h-16 bg-gray-800">
        <h1 className="text-xl font-bold">Rift Console</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
