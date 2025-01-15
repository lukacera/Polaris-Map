import { Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface LocationSelectData {
  lng: number;
  lat: number;
  zoom: number;
  name: string;
}

interface SearchBarProps {
  onLocationSelect?: (data: LocationSelectData) => void;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  place_type: string[];
}

interface MapboxResponse {
  features: MapboxFeature[];
}

export default function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (searchQuery: string) => {
    if (!searchQuery) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=&types=address,place,locality`
      );
      const data: MapboxResponse = await response.json();
      setSuggestions(data.features);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setSuggestions([]);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    const timeoutId = setTimeout(() => {
      searchLocations(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSuggestionClick = (suggestion: MapboxFeature) => {
    setQuery(suggestion.place_name);
    setShowDropdown(false);
    
    if (onLocationSelect) {
      onLocationSelect({
        lng: suggestion.center[0],
        lat: suggestion.center[1],
        zoom: suggestion.place_type[0] === 'address' ? 17 : 13,
        name: suggestion.place_name
      });
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Enter a city name"
        className="w-64 px-4 py-2 bg-background-lighter text-white rounded-lg border
        border-background focus:outline-none focus:border-blue-500 pl-10 shadow-lg"
      />
      {isLoading ? (
        <div className="absolute left-3 top-2.5 w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin" />
      ) : (
        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
      )}
      
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-64 mt-1 bg-background-lighter border border-background 
        rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-background focus:bg-background 
              focus:outline-none text-white"
            >
              <div className="font-medium">{suggestion.text}</div>
              <div className="text-sm text-gray-400">{suggestion.place_name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}