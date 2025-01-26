import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

interface PriceInputProps {
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
  onBlur: (value: number) => void;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  min,
  max,
  step,
  label,
  onBlur
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsFocused(false);
    const boundedValue = Math.min(Math.max(localValue, min), max);
    setLocalValue(boundedValue);
    onBlur(boundedValue);
  };

  const handleChange = (newValue: number) => {
    setLocalValue(newValue);
  };

  return (
    <div className="w-full max-w-xs">
      <label className="block mb-2 text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
          <DollarSign className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={(e) => handleChange(Number(e.target.value))}
          onBlur={handleBlur}
          onFocus={() => setIsFocused(true)}
          className={`w-full pl-10 pr-4 py-2 bg-gray-800 border rounded-lg 
            text-gray-100 placeholder-gray-400 text-sm
            transition-colors duration-200
            ${isFocused 
              ? 'border-blue-500 ring-1 ring-blue-500/20' 
              : 'border-gray-700 hover:border-gray-600'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
        />
      </div>
      <div className="mt-1 text-xs text-gray-400">
        Min: ${min} · Max: ${max}
      </div>
    </div>
  );
};