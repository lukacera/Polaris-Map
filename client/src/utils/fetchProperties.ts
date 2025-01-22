import { Property } from "../types/Property";

const apiUrl = import.meta.env.VITE_API_URL;
type Props = {
    setProperties: (properties: GeoJSON.FeatureCollection) => void;
    map: React.MutableRefObject<mapboxgl.Map | null>;
}

export const fetchProperties = async ({map, setProperties}: Props) => {
    try {
      const response = await fetch(`${apiUrl}/properties`);
      const data = await response.json();
      
      const geoJsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: data.map((property: Property, index: number) => (
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

      setProperties(geoJsonData);

      if (map.current?.getSource('realEstate')) {
        (map.current.getSource('realEstate') as mapboxgl.GeoJSONSource).setData(geoJsonData);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };
