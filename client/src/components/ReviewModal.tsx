import React, { useState } from 'react';
import { X, Home, DollarSign, Maximize2, BedDouble, Calendar, MapPin } from 'lucide-react';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PropertyModal: React.FC<PropertyModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    price: '',
    type: 'Apartment',
    size: '',
    rooms: '',
    yearBuilt: new Date().getFullYear().toString(),
    status: 'Buy',
    coordinates: ['', '']
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const propertyData = {
      ...formData,
      geometry: {
        type: 'Point',
        coordinates: formData.coordinates.map(Number)
      },
      pricePerSquareMeter: Number(formData.price) / Number(formData.size)
    };
    console.log(propertyData);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('coordinate')) {
      const index = Number(name.slice(-1));
      setFormData(prev => ({
        ...prev,
        coordinates: prev.coordinates.map((c, i) => i === index ? value : c)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-background text-white rounded-2xl p-8 w-full max-w-2xl mx-4 relative shadow-2xl border border-surface-border">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors duration-200 
            hover:bg-surface-border/10 p-2 rounded-full"
          type="button"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-bold mb-8">
          Add New Property
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main form grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Property Type */}
            <div className="space-y-2 relative">
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <Home size={16} className="mr-2 text-blue-400" />
                Property Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-3 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-surface-border focus:border-transparent transition-all duration-200
                  cursor-pointer appearance-none shadow-xl" 
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <DollarSign size={16} className="mr-2 text-green-400" />
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-3 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  hover:border-surface-border/70 cursor-pointer appearance-none shadow-xl"
              >
                <option value="Buy">For Sale</option>
                <option value="Rent">For Rent</option>
              </select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <DollarSign size={16} className="mr-2 text-yellow-400" />
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-3 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  hover:border-surface-border/70 placeholder-gray-500"
                placeholder="Enter price"
              />
            </div>

            {/* Size */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <Maximize2 size={16} className="mr-2 text-purple-400" />
                Size (m²)
              </label>
              <input
                type="number"
                name="size"
                value={formData.size}
                min={1}
                onChange={handleInputChange}
                className="w-full p-3 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  hover:border-surface-border/70 placeholder-gray-500"
                placeholder="Enter size"
              />
            </div>

            {/* Rooms */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <BedDouble size={16} className="mr-2 text-pink-400" />
                Number of Rooms
              </label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms}
                onChange={handleInputChange}
                min="1"
                className="w-full p-3 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  hover:border-surface-border/70 placeholder-gray-500"
                placeholder="Enter number of rooms"
              />
            </div>

            {/* Year Built */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <Calendar size={16} className="mr-2 text-orange-400" />
                Year Built
              </label>
              <input
                type="number"
                name="yearBuilt"
                min={1000}
                max={new Date().getFullYear()}
                value={formData.yearBuilt}
                onChange={handleInputChange}
                className="w-full p-3 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  hover:border-surface-border/70 placeholder-gray-500"
                placeholder="Enter year built"
              />
            </div>
          </div>

          {/* Location coordinates */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <MapPin size={16} className="mr-2 text-red-400" />
              Location Coordinates
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                name="coordinate0"
                value={formData.coordinates[0]}
                onChange={handleInputChange}
                className="w-full p-3 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  hover:border-surface-border/70 placeholder-gray-500"
                placeholder="Longitude"
              />
              <input
                type="text"
                name="coordinate1"
                value={formData.coordinates[1]}
                onChange={handleInputChange}
                className="w-full p-3 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  hover:border-surface-border/70 placeholder-gray-500"
                placeholder="Latitude"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 hover:text-white transition-all duration-200
                border border-surface-border hover:border-surface-border/70 rounded-xl hover:bg-surface-border/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-accent text-white rounded-xl transition-all duration-200 font-medium
                hover:bg-accent-hover"
            >
              Create Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyModal;