import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { 
  DollarSign, 
  Home,
  Bed,
  X
} from 'lucide-react';
import { fetchProperties } from '../utils/fetchProperties';
import { FilterState } from '../types/FilterState';
import { debounce } from '../utils/debounce';
import { PriceInput } from './PriceInput';

export const FiltersSidebar: React.FC<{
  isSidebarOpen: boolean;
  onFilterChange?: (filters: FilterState) => void;
  onClose?: () => void;
  setProperties: Dispatch<SetStateAction<GeoJSON.FeatureCollection>>;
  minPrice: number | null;
  maxPrice: number | null;
  status: "Rent" | "Buy";
}> = ({ isSidebarOpen, onFilterChange, onClose, setProperties, minPrice, maxPrice, status }) => {
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState<FilterState>({
    propertyTypes: [],
    minPrice: 0,
    maxPrice: 5000,
    rooms: [],
    status: status
  });

  const [appliedFilters, setAppliedFilters] = useState<{
    id: string;
    label: string;
    value: string;
  }[]>([]);

  useEffect(() => {
    if (minPrice === 0 && maxPrice === 0) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      if (minPrice !== null && maxPrice !== null) {
        setFilters(prev => ({
          ...prev,
          minPrice: Math.floor(minPrice),
          maxPrice: Math.ceil(maxPrice)
        }));
      }
    }
  }, [minPrice, maxPrice]);

  const propertyTypes = [
    'Apartment',
    'House'
  ];

  const handlePropertyTypeChange = (type: string) => {
    const updatedTypes = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter(t => t !== type)
      : [...filters.propertyTypes, type];
    
    const newFilters = { ...filters, propertyTypes: updatedTypes };
    setFilters(newFilters);
    
    if (filters.propertyTypes.includes(type)) {
      setAppliedFilters(appliedFilters.filter(f => f.id !== `type-${type}`));
    } else {
      setAppliedFilters([...appliedFilters, {
        id: `type-${type}`,
        label: 'Type',
        value: type
      }]);
    }
    
    onFilterChange?.(newFilters);
  };

  const handlePriceBlur = (value: number, type: 'minPrice' | 'maxPrice') => {
    console.log("handle blur")
    console.log(value)
    let newValue = Math.round(value);
  
    if (type === 'minPrice') {
      newValue = Math.min(newValue, filters.maxPrice);
    } else {
      newValue = Math.max(newValue, filters.minPrice);
    }
  
    const newFilters = { ...filters, [type]: newValue };
    setFilters(newFilters);
  
    const existingPriceFilter = appliedFilters.find(f => f.id === `price-${type}`);
    if (existingPriceFilter) {
      setAppliedFilters(appliedFilters.map(f =>
        f.id === `price-${type}`
          ? { ...f, value: `$${newValue}` }
          : f
      ));
    } else {
      setAppliedFilters([...appliedFilters, {
        id: `price-${type}`,
        label: `Price ${type === 'minPrice' ? 'From' : 'To'}`,
        value: `$${newValue}`
      }]);
    }
  
    onFilterChange?.(newFilters);
  };

  const handleBedroomChange = (count: string) => {
    const updatedrooms = filters.rooms.includes(count)
      ? filters.rooms.filter(b => b !== count)
      : [...filters.rooms, count];
    
    const newFilters = { ...filters, rooms: updatedrooms };
    setFilters(newFilters);
    
    if (filters.rooms.includes(count)) {
      setAppliedFilters(appliedFilters.filter(f => f.id !== `bedroom-${count}`));
    } else {
      setAppliedFilters([...appliedFilters, {
        id: `bedroom-${count}`,
        label: 'Rooms',
        value: count
      }]);
    }
    
    onFilterChange?.(newFilters);
  };

  const handleAppliedFilterRemove = (filterId: string) => {
    const [type, value] = filterId.split('-');
    const newFilters = { ...filters };
    
    switch (type) {
      case 'type':
        newFilters.propertyTypes = filters.propertyTypes.filter(t => t !== value);
        break;
      case 'bedroom':
        newFilters.rooms = filters.rooms.filter(b => b !== value);
        break;
      case 'price':
        if (value === 'minPrice') {
          newFilters.minPrice = minPrice ?? 0;
        } else {
          newFilters.maxPrice = maxPrice ?? 5000;
        }
        break;
    }
    
    setFilters(newFilters);
    setAppliedFilters(appliedFilters.filter(f => f.id !== filterId));
    onFilterChange?.(newFilters);
  };

  const handleSubmit = async () => {
    try {
      const {geoJsonData} = await fetchProperties(filters)
      
      setProperties(geoJsonData);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  return (
    <div 
      className={`absolute top-0 right-0 h-full rounded-l-lg
        bg-background backdrop-blur-sm text-gray-100 z-10 border-l border-gray-500  
        transition-all duration-300 overflow-y-auto overflow-x-hidden
        ${isSidebarOpen ? 'w-96' : 'w-0'}`}
    >
      <div className="absolute top-0 left-0 right-0 bg-background z-20 border-b
      border-gray-500">
        <div className="flex justify-between items-center p-6">
          <h2 className="text-xl font-semibold">Filters</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="h-full overflow-y-auto pt-20">
        <div className="px-6 mt-5 flex flex-col gap-7">
          {/* Property Type Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Home className="w-5 h-5" />
                <span>Property Type</span>
              </div>
              <span className="text-sm text-gray-400">
                {filters.propertyTypes.length} selected
              </span>
            </div>
            
            <div className="space-y-2 ml-7">
              {propertyTypes.map(type => (
                <label key={type} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.propertyTypes.includes(type)}
                    onChange={() => handlePropertyTypeChange(type)}
                    className="form-checkbox h-4 w-4 rounded border-slate-600 text-blue-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Price Range</span>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            ) : (
              <div className="flex flex-col gap-7 ml-2">
                <div className="flex flex-col gap-7 ml-2">
                  <PriceInput
                    value={filters.minPrice}
                    min={minPrice ?? 0}
                    max={maxPrice ?? 5000}
                    step={10000}
                    label="Minimum"
                    onBlur={(value) => handlePriceBlur(value, 'minPrice')}
                  />
                  <PriceInput
                    value={filters.maxPrice}
                    min={minPrice ?? 0}
                    max={maxPrice ?? 5000}
                    step={10000}
                    label="Maximum"
                    onBlur={(value) => handlePriceBlur(value, 'maxPrice')}
                  />
                </div>
              </div>
            )}
          </div>

          {/* rooms Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bed className="w-5 h-5" />
              <span>rooms</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['Any', '1', '2', '3+'].map(count => (
                <button
                  key={count}
                  onClick={() => handleBedroomChange(count)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    filters.rooms.includes(count)
                      ? 'bg-accent text-white'
                      : 'bg-surface hover:bg-surface-active text-gray-100'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Applied Filters */}
          {appliedFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {appliedFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-full text-sm"
                >
                  <span>{filter.label}: {filter.value}</span>
                  <button
                    onClick={() => handleAppliedFilterRemove(filter.id)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-5 my-7 flex-col sm:flex-row">
            <button
              onClick={handleSubmit}
              className="w-full bg-accent hover:bg-accent-hover text-white py-2 px-4 
              rounded-md transition-colors"
            >
              Apply Filters
            </button>

            <button
              onClick={() => {
                const resetFilters = {
                  propertyTypes: [],
                  minPrice: minPrice ?? 0,
                  maxPrice: maxPrice ?? 5000,
                  rooms: [],
                  bathrooms: [],
                  status: "Buy" as "Buy" | "Rent"
                };
                setFilters(resetFilters);
                setAppliedFilters([]); 
                onFilterChange?.(resetFilters);
              }}
              className="w-full bg-red-500/80 hover:bg-red-500 text-white py-2 px-4
              rounded-md transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersSidebar;