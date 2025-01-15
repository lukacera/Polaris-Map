import React, { useState } from 'react';
import { 
  DollarSign, 
  Home,
  Bed,
  X
} from 'lucide-react';

interface PriceRange {
  min: number;
  max: number;
}

interface FilterState {
  propertyTypes: string[];
  priceRange: PriceRange;
  bedrooms: string[];
  bathrooms: string[];
}

export const FiltersSidebar: React.FC<{
  isSidebarOpen: boolean;
  onFilterChange?: (filters: FilterState) => void;
  onClose?: () => void;
}> = ({ isSidebarOpen, onFilterChange, onClose }) => {
  
  const [filters, setFilters] = useState<FilterState>({
    propertyTypes: [],
    priceRange: { min: 0, max: 5000 },
    bedrooms: [],
    bathrooms: [],
  });

  const [appliedFilters, setAppliedFilters] = useState<{
    id: string;
    label: string;
    value: string;
  }[]>([]);

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

  const handlePriceRangeChange = (value: number, type: 'min' | 'max') => {
    const newPriceRange = { ...filters.priceRange, [type]: value };
    const newFilters = { ...filters, priceRange: newPriceRange };
    setFilters(newFilters);
    
    const existingPriceFilter = appliedFilters.find(f => f.id === `price-${type}`);
    if (existingPriceFilter) {
      setAppliedFilters(appliedFilters.map(f => 
        f.id === `price-${type}` 
          ? { ...f, value: `$${value}` }
          : f
      ));
    } else {
      setAppliedFilters([...appliedFilters, {
        id: `price-${type}`,
        label: `Price ${type === 'min' ? 'From' : 'To'}`,
        value: `$${value}`
      }]);
    }
    
    onFilterChange?.(newFilters);
  };

  const handleBedroomChange = (count: string) => {
    const updatedBedrooms = filters.bedrooms.includes(count)
      ? filters.bedrooms.filter(b => b !== count)
      : [...filters.bedrooms, count];
    
    const newFilters = { ...filters, bedrooms: updatedBedrooms };
    setFilters(newFilters);
    
    if (filters.bedrooms.includes(count)) {
      setAppliedFilters(appliedFilters.filter(f => f.id !== `bedroom-${count}`));
    } else {
      setAppliedFilters([...appliedFilters, {
        id: `bedroom-${count}`,
        label: 'Bedrooms',
        value: count
      }]);
    }
    
    onFilterChange?.(newFilters);
  };

  return (
    <div 
      className={`absolute top-0 right-0 h-full rounded-l-lg
        bg-background backdrop-blur-sm text-gray-100 z-10 
        transition-all duration-300 overflow-y-auto overflow-x-hidden
        ${isSidebarOpen ? 'w-80' : 'w-0'}`}
    >
      <div className="flex justify-between items-center p-6">
          <h2 className="text-xl font-semibold">Filters</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
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
          
          <div className="space-y-6 ml-7">
            <div>
              <label className="text-sm text-gray-400">Minimum</label>
              <div className="flex items-center space-x-2">
                <span className="text-sm">$</span>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange(Number(e.target.value), 'min')}
                  className="w-full appearance-none bg-gray-800 h-1 rounded-lg focus:outline-none 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-surface-active [&::-webkit-slider-thumb]:cursor-pointer 
                  [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-surface-active 
                  [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer 
                  [&::-ms-thumb]:appearance-none [&::-ms-thumb]:w-4 [&::-ms-thumb]:h-4 
                  [&::-ms-thumb]:rounded-full [&::-ms-thumb]:bg-surface-active [&::-ms-thumb]:cursor-pointer"
                />
                <span className="text-sm w-16 text-gray-300">{filters.priceRange.min}</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Maximum</label>
              <div className="flex items-center space-x-2">
                <span className="text-sm">$</span>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange(Number(e.target.value), 'max')}
                  className="w-full appearance-none bg-gray-800 h-1 rounded-lg focus:outline-none 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-surface-active [&::-webkit-slider-thumb]:cursor-pointer 
                  [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 
                  [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
                  [&::-moz-range-thumb]:bg-surface-active [&::-moz-range-thumb]:border-0 
                  [&::-moz-range-thumb]:cursor-pointer [&::-ms-thumb]:appearance-none 
                  [&::-ms-thumb]:bg-surface-active [&::-ms-thumb]:cursor-pointer"
                />
                <span className="text-sm w-16 text-gray-300">{filters.priceRange.max}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bedrooms Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Bed className="w-5 h-5" />
            <span>Bedrooms</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['Any', '1', '2', '3+'].map(count => (
              <button
                key={count}
                onClick={() => handleBedroomChange(count)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  filters.bedrooms.includes(count)
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
                  onClick={() => {
                    setAppliedFilters(appliedFilters.filter(f => f.id !== filter.id));
                  }}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-5 my-7">
          <button
            onClick={() => onFilterChange?.(filters)}
            className="w-full bg-accent hover:bg-accent-hover text-white py-2 rounded-md transition-colors"
          >
            Apply Filters
          </button>

          <button
            onClick={() => {
              const resetFilters = {
                propertyTypes: [],
                priceRange: { min: 0, max: 5000 },
                bedrooms: [],
                bathrooms: [],
              };
              setFilters(resetFilters);
              setAppliedFilters([]); 
              onFilterChange?.(resetFilters);
            }}
            className="w-full bg-red-500/80 hover:bg-red-500 text-white py-2 rounded-md transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersSidebar;