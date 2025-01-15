import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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

  // Initialize session token
  useEffect(() => {
    setSessionToken(uuidv4());
  }, []);

  // Typed debounce function
  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: any;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

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
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-64 px-4 py-2 bg-background-lighter text-white rounded-lg border
            border-background focus:outline-none focus:border-blue-500 pl-10 shadow-lg"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="absolute z-50 w-64 mt-1 bg-background-lighter border border-background 
          rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.mapbox_id}
              onClick={() => handleSuggestionSelect(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-background focus:bg-background 
                focus:outline-none text-white"
            >
              <div className="font-medium">{suggestion.name}</div>
              {suggestion.full_address && (
                <div className="text-sm text-gray-400">{suggestion.full_address}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapboxSearchBox;