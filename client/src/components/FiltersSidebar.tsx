import { DollarSign, Filter, Home } from 'lucide-react'

export const FiltersSidebar: React.FC<{
    isSidebarOpen: boolean
}> = ({ isSidebarOpen }) => { 
  return (
    <div className={`absolute top-0 right-0 h-full bg-gray-800 text-white z-10 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        <div className="p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-6 pt-8">Filters</h2>
        
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <span>Property Type</span>
            </div>
            <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Price Range</span>
            </div>
            <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Additional Filters</span>
            </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
            <h3 className="text-sm font-medium mb-2">Structure</h3>
            <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-700">Studio</button>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-700">One-Bedroom</button>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-700">Two-Bedroom</button>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-700">Three-Bedroom</button>
            </div>
        </div>
        </div>
    </div>
  )
}
