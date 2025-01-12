export interface PropertyInput {
  geometry: {
    type: string;
    coordinates: number[];
  };
  price: number;
  type: string;
  size: number;
  rooms: number;
  yearBuilt: number;
  status: string;
  pricePerSquareMeter: number;
}

export function validateProperty(property: PropertyInput): string[] {
  const errors: string[] = [];

  // Geometry validation
  if (!property.geometry) {
    errors.push('Geometry is required');
  } else {
    if (property.geometry.type !== 'Point') {
      errors.push('Geometry type must be "Point"');
    }
    if (!Array.isArray(property.geometry.coordinates) || 
        property.geometry.coordinates.length !== 2 ||
        !property.geometry.coordinates.every(coord => typeof coord === 'number')) {
      errors.push('Geometry coordinates must be an array of 2 numbers');
    } else {
      const [lat, long] = property.geometry.coordinates;
      // Latitude and Longitude validation
      const parsedLat = parseFloat(lat.toString());
      const parsedLong = parseFloat(long.toString());

      if (parsedLat < -90 || parsedLat > 90) {
        errors.push('Latitude must be between -90 and 90 (first element of coordinates)');
      }
      if (parsedLong < -180 || parsedLong > 180) {
        errors.push('Longitude must be between -180 and 180 (second element of coordinates)');
      }
    }
  }

  // Price validation
  const parsedPrice = parseFloat(property.price.toString());
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    errors.push('Price must be a positive number');
  }

  // Type validation
  if (!['Apartment', 'House'].includes(property.type)) {
    errors.push('Property type must be either "Apartment" or "House"');
  }

  // Size validation
  const parsedSize = parseFloat(property.size.toString());
  if (isNaN(parsedSize) || parsedSize <= 0) {
    errors.push('Size must be a positive number');
  }

  // Rooms validation
  const parsedRooms = parseInt(property.rooms.toString(), 10);
  if (isNaN(parsedRooms) || parsedRooms < 1) {
    errors.push('Number of rooms must be at least 1');
  }

  // Year built validation
  const parsedYearBuilt = parseInt(property.yearBuilt.toString(), 10);
  if (isNaN(parsedYearBuilt) || parsedYearBuilt < 1000 || parsedYearBuilt > new Date().getFullYear()) {
    errors.push('Year built must be between 1000 and current year');
  }

  // Status validation
  if (!['Buy', 'Rent'].includes(property.status)) {
    errors.push('Status must be either "Buy" or "Rent"');
  }

  // If there are any errors, return them
  return errors;
}
