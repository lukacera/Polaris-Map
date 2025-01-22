import { Property } from "../types/Property";
import { FeatureCollection } from 'geojson';

const apiUrl = import.meta.env.VITE_API_URL;
export const fetchProperties = async (status: "Rent" | "Buy"): Promise<{ geoJsonData: FeatureCollection, minPrice: number, maxPrice: number }> => {
    try {
      const params = new URLSearchParams({ status });
      const response = await fetch(`${apiUrl}/properties?${params.toString()}`);
      const data: {
        data: Property[];
        minPrice: number;
        maxPrice: number;
      } = await response.json();
      console.log(data);
      const geoJsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: data.data.map((property: Property, index: number) => (
          {
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

      console.log(geoJsonData);
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
