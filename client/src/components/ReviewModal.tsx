import React, { useState } from 'react';
import { X } from 'lucide-react';

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
    yearBuilt: '',
    status: 'Buy',
    coordinates: ['', ''] // [longitude, latitude]
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-background text-white rounded-xl p-8 w-full max-w-2xl mx-4 relative shadow-xl">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-white hover:text-gray-300 transition-colors duration-200"
          type="button"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-white">Add New Property</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Property Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-2 border border-blue-400 rounded-lg bg-gray-800 text-white 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-2 border border-blue-400 rounded-lg bg-gray-800 text-white 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Buy">For Sale</option>
                <option value="Rent">For Rent</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-2 border border-blue-400 rounded-lg bg-gray-800 text-white 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter price"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Size (m²)</label>
              <input
                type="number"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full p-2 border border-blue-400 rounded-lg bg-gray-800 text-white 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter size"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Number of Rooms</label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms}
                onChange={handleInputChange}
                min="1"
                className="w-full p-2 border border-blue-400 rounded-lg bg-gray-800 text-white 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter number of rooms"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Year Built</label>
              <input
                type="number"
                name="yearBuilt"
                value={formData.yearBuilt}
                onChange={handleInputChange}
                className="w-full p-2 border border-blue-400 rounded-lg bg-gray-800 text-white 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter year built"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Location Coordinates</label>
            <div className="flex space-x-4">
              <input
                type="text"
                name="coordinate0"
                value={formData.coordinates[0]}
                onChange={handleInputChange}
                className="w-full p-2 border border-blue-400 rounded-lg bg-gray-800 text-white 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Longitude"
              />
              <input
                type="text"
                name="coordinate1"
                value={formData.coordinates[1]}
                onChange={handleInputChange}
                className="w-full p-2 border border-blue-400 rounded-lg bg-gray-800 text-white 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Latitude"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-white hover:text-gray-300 transition-colors duration-200
                border border-transparent hover:border-blue-400 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                transition-colors duration-200 font-medium"
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