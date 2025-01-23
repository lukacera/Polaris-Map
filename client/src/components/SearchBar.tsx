import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from '../utils/debounce';

// Define interfaces for our component's props and data structures
interface MapboxSearchBoxProps {
  onSelectLocation?: (location: MapboxFeature) => void;
  placeholder?: string;
  proximity?: string;
  map: React.MutableRefObject<mapboxgl.Map | null>;
}

// Interface for the suggestion response from Mapbox API
interface MapboxSuggestion {
  name: string;
  mapbox_id: string;
  full_address?: string;
  feature_type: string;
  context: {
    country?: {
      name: string;
      country_code: string;
    };
    region?: {
      name: string;
    };
    place?: {
      name: string;
    };
  };
}

// Interface for the suggestion response wrapper
interface MapboxSuggestResponse {
  suggestions: MapboxSuggestion[];
}

// Interface for the retrieved feature from Mapbox API
interface MapboxFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    name: string;
    full_address?: string;
    feature_type: string;
    context: {
      country?: {
        name: string;
        country_code: string;
      };
      region?: {
        name: string;
      };
      place?: {
        name: string;
      };
    };
  };
}

// Interface for the retrieve response wrapper
interface MapboxRetrieveResponse {
  type: string;
  features: MapboxFeature[];
}

const MapboxSearchBox: React.FC<MapboxSearchBoxProps> = ({ 
  onSelectLocation,
  placeholder = "Search for a location...",
  proximity = "-122.4194,37.7749", // Default to San Francisco
  map
}) => {
  // State declarations with proper typing
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Create ref for the search box container
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Initialize session token
  useEffect(() => {
    setSessionToken(uuidv4());
  }, []);

  // Handle clicks outside the search box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch suggestions from Mapbox API with proper typing
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?` +
        `q=${encodeURIComponent(searchQuery)}` +
        `&language=en` +
        `&proximity=${proximity}` +
        `&session_token=${sessionToken}` +
        `&access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}`
      );

      if (!response.ok) throw new Error('Search request failed');
      
      const data: MapboxSuggestResponse = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken, proximity]);

  // Handle suggestion selection with proper typing
  const handleSuggestionSelect = async (suggestion: MapboxSuggestion) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}` +
        `?session_token=${sessionToken}` +
        `&access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}`
      );
  
      if (!response.ok) throw new Error('Retrieve request failed');
      
      const data: MapboxRetrieveResponse = await response.json();
      const location = data.features[0];
      
      if (location) {
        // If we have a map reference, fly to the location
        if (map.current) {
          map.current.flyTo({
            center: location.geometry.coordinates,
            zoom: location.properties.feature_type === 'address' ? 17 : 13,
            duration: 2000,
            essential: true
          });
        }
  
        if (onSelectLocation) {
          onSelectLocation(location);
        }
      }
      
      setQuery(suggestion.name);
      setSuggestions([]);
    } catch (error) {
      console.error('Error retrieving location details:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create debounced version of fetchSuggestions
  const debouncedFetchSuggestions = useCallback(
    debounce((query: string) => fetchSuggestions(query), 300),
    [fetchSuggestions]
  );

  // Handle input changes with proper event typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetchSuggestions(value);
  };

  return (
    <div className="relative w-full" ref={searchBoxRef}>
      <div className="relative flex items-center w-full">
        {/* Search Input Container */}
        <div className="relative flex-1 flex items-center">
          {/* Search Icon */}
          <Search className="absolute left-3 text-gray-400 w-4 h-4 pointer-events-none" />
          
          {/* Input Field */}
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full min-w-[16rem] h-10 pl-9 pr-8 bg-background-lighter 
                     text-white rounded-lg border border-background 
                     focus:outline-none focus:border-blue-500 shadow-lg"
          />
          
          {/* Clear and Loading Icons Container */}
          <div className="absolute right-2 flex items-center space-x-1">
            {query && !isLoading && (
              <button
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                }}
                className="p-1 text-gray-400 hover:text-white transition-colors
                         rounded-full hover:bg-background/50 focus:outline-none"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isLoading && (
              <div className="w-4 h-4">
                <div className="animate-spin rounded-full w-4 h-4 
                             border-2 border-gray-400 border-t-blue-500">
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-50 w-full min-w-[16rem] mt-1 
                      bg-background-lighter border border-background 
                      rounded-lg shadow-lg max-h-[27.5rem] overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.mapbox_id}
              onClick={() => handleSuggestionSelect(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-background 
                      focus:bg-background focus:outline-none text-white
                      transition-colors duration-150"
            >
              <div className="font-medium">{suggestion.name}</div>
              {suggestion.full_address && (
                <div className="text-sm text-gray-400 truncate">
                  {suggestion.full_address}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapboxSearchBox;