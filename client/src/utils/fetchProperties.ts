import { Property } from "../types/Property";
import { FeatureCollection } from 'geojson';
import { FilterState } from "../types/FilterState";

const apiUrl = import.meta.env.VITE_API_URL;

export const fetchProperties = async (filters: FilterState): Promise<{ 
  geoJsonData: FeatureCollection, 
  minPrice: number, 
  maxPrice: number 
}> => {
    try {
      // Initialize URL parameters
      const params = new URLSearchParams();
      
      // Add status parameter
      params.append('status', filters.status);

      console.log(filters.propertyTypes)
      // Add property types if present
      if (filters.propertyTypes.length > 0) {
        params.append('types', filters.propertyTypes.join(','));
      }

      // Add price range
      if (filters.minPrice) {
        params.append('minPrice', filters.minPrice.toString());
      }
      if (filters.maxPrice) {
        params.append('maxPrice', filters.maxPrice.toString());
      }

      // Add rooms if present
      if (filters.rooms.length > 0) {
        params.append('rooms', filters.rooms.join(','));
      }

      const response = await fetch(`${apiUrl}/properties?${params.toString()}`);
      const data: {
        data: Property[];
        minPrice: number;
        maxPrice: number;
      } = await response.json();

      const geoJsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: data.data.map((property: Property, index: number) => ({
          type: 'Feature',
          id: property._id || index,
          properties: {
            id: property._id,
            price: property.price,
            size: property.size,
            pricePerSquareMeter: property.pricePerSquareMeter,
            rooms: property.rooms,
            yearBuilt: property.yearBuilt,
            type: property.type.toLowerCase(),
            status: property.status,
            updatedAt: property.updatedAt,
            numberOfReviews: property.numberOfReviews,
            dataReliability: property.dataReliability
          },
          geometry: property.geometry
        }))
      };

      return {
        geoJsonData: geoJsonData,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice
      };
      
    } catch (error) {
      console.error('Error fetching properties:', error);
      return {
        geoJsonData: {
          type: 'FeatureCollection',
          features: []
        },
        minPrice: 0,
        maxPrice: 0
      };
    }
  };