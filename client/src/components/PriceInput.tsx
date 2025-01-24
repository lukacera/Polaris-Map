import React, { useState, useEffect } from 'react';

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

  // Update local value whenever the prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    // Ensure the value is within bounds
    const boundedValue = Math.min(Math.max(localValue, min), max);
    setLocalValue(boundedValue);
    onBlur(boundedValue);
  };

  const handleChange = (newValue: number) => {
    const boundedValue = Math.min(Math.max(newValue, min), max);
    setLocalValue(boundedValue);
  };

  return (
    <div className="flex flex-col items-start w-full space-y-3">
      <label className="text-sm text-gray-400">{label}</label>
      <div className="flex items-center space-x-2 w-full">
        <span className="text-sm">$</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={(e) => handleChange(Number(e.target.value))}
          onBlur={handleBlur}
          className="flex-1 appearance-none bg-gray-800 h-1 rounded-lg focus:outline-none
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-surface-active
          [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={localValue}
        onChange={(e) => handleChange(Number(e.target.value))}
        onBlur={handleBlur}
        className="px-2 py-1 text-sm bg-gray-800 rounded border 
        border-gray-700 focus:outline-none focus:border-blue-500"
      />
    </div>
  );
};