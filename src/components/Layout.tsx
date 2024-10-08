import React from 'react'
import { Clipboard, FileText, Settings } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <nav className="bg-white w-16 flex flex-col items-center py-4">
        <div className="mb-8">
          <Clipboard className="w-8 h-8 text-blue-600" />
        </div>
        <ul className="space-y-4">
          <li>
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <FileText className="w-6 h-6 text-gray-600" />
            </button>
          </li>
          <li>
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </li>
        </ul>
      </nav>
      <main className="flex-1 p-8 overflow-hidden">
        {children}
      </main>
    </div>
  )
}