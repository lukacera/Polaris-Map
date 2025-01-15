import React, { useEffect, useState } from 'react';
import { X, Home, DollarSign, Maximize2, BedDouble, Calendar, MapPin } from 'lucide-react';
import { validateForm } from '../utils/validatePropFormData';
import { PropFormData } from '../types/PropFormData';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates?: number[];
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

const PropertyModal: React.FC<PropertyModalProps> = ({ 
  isOpen, onClose, coordinates, mapRef
}) => {
  const [formData, setFormData] = useState<PropFormData>({
    price: '',
    type: 'Apartment',
    size: '',
    rooms: '',
    yearBuilt: new Date().getFullYear().toString(),
    status: 'Buy',
    coordinates: ["-0.1276", "51.5074"] // Default coordinates for London
  });
  
  const apiUrl = import.meta.env.VITE_API_URL;

  const [errors, setErrors] = useState<string[]>([]);
  
  useEffect(() => {
    setErrors([]);
    console.log('coordinates', coordinates);
    setFormData({
      price: '',
      type: 'Apartment',
      size: '',
      rooms: '',
      yearBuilt: new Date().getFullYear().toString(),
      status: 'Buy',
      coordinates: coordinates && coordinates?.length > 0 ? coordinates.map(String) : ["-0.1276", "51.5074"]
    });
    
  }, [isOpen, coordinates]);
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) return;
    
    const propertyData = {
      ...formData,
      geometry: {
        type: 'Point',
        coordinates: formData.coordinates.map(Number)
      },
      pricePerSquareMeter: Number(formData.price) / Number(formData.size)
    };
    try {
      const response = await fetch(`${apiUrl}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add the new point to the map's source
        const source = mapRef.current?.getSource('realEstate') as mapboxgl.GeoJSONSource;
        if (source) {
          const newFeature = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: formData.coordinates.map(Number)
            },
            properties: {
              id: data._id,
              price: Number(formData.price),
              size: Number(formData.size),
              pricePerSquareMeter: Number(formData.price) / Number(formData.size),
              rooms: Number(formData.rooms),
              yearBuilt: Number(formData.yearBuilt),
              type: formData.type.toLowerCase(),
              status: formData.status,
              updatedAt: new Date().toISOString(),
              numberOfReviews: 0,
              dataReliability: 'new'
            }
          };

          const currentData = (source.serialize().data as any);
          currentData.features.push(newFeature);
          source.setData(currentData);
        }

        // Animate to the new property location
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [Number(formData.coordinates[0]), Number(formData.coordinates[1])],
            zoom: 20,
            duration: 2000,
            essential: true
          });
        }
        
        onClose();
      }
    } catch (error) {
      console.error('Error adding property:', error);
      setErrors([...errors, 'Failed to add property. Please try again.']);
    }  
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('coordinate')) {
      const index = Number(name.slice(-1));
      setFormData(prev => ({
        ...prev,
        coordinates: prev.coordinates.map((c, i) => i === index ? value : c) as [string, string]
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-background text-white rounded-2xl p-6 w-full max-w-4xl mx-4 relative shadow-2xl border border-surface-border">
        <button 
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors duration-200 
            hover:bg-surface-border/10 p-2 rounded-full"
          type="button"
        >
          <X size={18} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">
          Add New Property
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-5">
            {/* Property Type */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300">
                <Home size={16} className="mr-2 text-blue-400" />
                Property Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  cursor-pointer appearance-none shadow-xl" 
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300">
                <DollarSign size={16} className="mr-2 text-green-400" />
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  cursor-pointer appearance-none shadow-xl"
              >
                <option value="Buy">For Sale</option>
                <option value="Rent">For Rent</option>
              </select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300">
                <DollarSign size={16} className="mr-2 text-yellow-400" />
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  placeholder-gray-500"
                placeholder="Enter price"
              />
            </div>

            {/* Size */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300">
                <Maximize2 size={16} className="mr-2 text-purple-400" />
                Size (m²)
              </label>
              <input
                type="number"
                name="size"
                value={formData.size}
                min={1}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  placeholder-gray-500"
                placeholder="Enter size"
              />
            </div>

            {/* Rooms */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300">
                <BedDouble size={16} className="mr-2 text-pink-400" />
                Number of Rooms
              </label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms}
                onChange={handleInputChange}
                min="1"
                className="w-full p-2.5 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  placeholder-gray-500"
                placeholder="Enter rooms"
              />
            </div>

            {/* Year Built */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300">
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
                className="w-full p-2.5 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  placeholder-gray-500"
                placeholder="Enter year"
              />
            </div>
          </div>

          {/* Location coordinates */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <MapPin size={16} className="mr-2 text-red-400" />
              Location Coordinates
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                name="coordinate0"
                value={formData.coordinates[0]}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  placeholder-gray-500"
                placeholder="Longitude"
              />
              <input
                type="text"
                name="coordinate1"
                value={formData.coordinates[1]}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-surface-border rounded-xl bg-background text-white 
                  focus:ring-2 focus:ring-surface-border focus:border-transparent transition-all duration-200
                  placeholder-gray-500"
                placeholder="Latitude"
              />
            </div>
          </div>

          {errors.length > 0 && (
            <div className="space-y-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              {errors.map((error, index) => (
                <div 
                  key={index}
                  className="flex items-center text-sm text-red-400"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mr-2" />
                  {error}
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-300 hover:text-white transition-all duration-200
                border border-surface-border hover:border-surface-border/70 rounded-xl hover:bg-surface-border/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-accent text-white rounded-xl transition-all duration-200 font-medium
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