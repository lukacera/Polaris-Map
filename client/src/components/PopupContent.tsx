// components/PropertyPopup.tsx
import { Property } from '../types/Property';

interface PropertyPopupProps {
  property: Property;
  onClose: () => void;
}

const PropertyPopup = ({ property, onClose }: PropertyPopupProps) => {
  return (
    <div className="overflow-hidden bg-white">
      <div className="relative px-5 py-3 bg-accent text-white">
        <button 
          className="absolute top-2 right-2 p-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:text-gray-700 hover:bg-white transition-all duration-200"
          onClick={onClose}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold">
            {property.price} €
          </h2>
          <p className="text-gray-300 text-sm">{property.pricePerSquareMeter.toFixed(0)} €/m²</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Type</p>
            <p className="text-sm font-medium text-gray-900">{property.type}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Size</p>
            <p className="text-sm font-medium text-gray-900">{property.size}m²</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Rooms</p>
            <p className="text-sm font-medium text-gray-900">{property.rooms}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Floor</p>
            <p className="text-sm font-medium text-gray-900">2/3</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-gray-700">Data Reliability</p>
              <span className="text-xs text-gray-500">{property.numberOfReviews} reviews</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${property.dataReliability}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center mb-1">
              <div className="tooltip">
                <button className="text-xs text-gray-500 flex items-center gap-1">
                  Help
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M12 21a9 9 0 110-18 9 9 0 010 18z" />
                  </svg>
                </button>
                <span className="tooltip-text">
                  Help us improve price accuracy by voting:
                  <br/>• Lower - if the price seems too high
                  <br/>• OK - if the price seems accurate
                  <br/>• Higher - if the price seems too low
                </span>
              </div>
            </div>
            
            <div className="flex gap-1">
              <button 
                className="flex-1 flex items-center justify-center gap-1 p-1.5 bg-white border border-red-200 text-red-600 rounded
                        hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-xs font-medium group"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
                Lower
              </button>

              <button 
                className="flex-1 flex items-center justify-center gap-1 p-1.5 bg-white border border-green-200 text-green-600 rounded
                        hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-xs font-medium group"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                OK
              </button>

              <button 
                className="flex-1 flex items-center justify-center gap-1 p-1.5 bg-white border border-blue-200 text-blue-600 rounded
                        hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-xs font-medium group"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                </svg>
                Higher
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-right">
          Last review: {new Date(property.updatedAt).toLocaleDateString('en-US')}
        </p>
      </div>
    </div>
  );
};

export default PropertyPopup;