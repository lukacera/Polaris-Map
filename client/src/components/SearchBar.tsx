import { Search } from 'lucide-react'

export default function SearchBar() {
  return (
    <div className="relative">
        <input
            type="text"
            placeholder="Enter a city name"
            className="w-64 px-4 py-2 bg-background-lighter text-white rounded-lg border
            border-background focus:outline-none focus:border-blue-500 pl-10 shadow-lg"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
    </div>
  )
}
