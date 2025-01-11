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
    }
  }

  // Price validation
  if (typeof property.price !== 'number' || property.price <= 0) {
    errors.push('Price must be a positive number');
  }

  // Type validation
  if (!['Apartment', 'House'].includes(property.type)) {
    errors.push('Property type must be either "Apartment" or "House"');
  }

  // Size validation
  if (typeof property.size !== 'number' || property.size <= 0) {
    errors.push('Size must be a positive number');
  }

  // Rooms validation
  if (typeof property.rooms !== 'number' || property.rooms < 1) {
    errors.push('Number of rooms must be at least 1');
  }

  // Year built validation
  if (typeof property.yearBuilt !== 'number' || 
      property.yearBuilt < 1800 || 
      property.yearBuilt > new Date().getFullYear()) {
    errors.push('Year built must be between 1800 and current year');
  }

  // Status validation
  if (!['Buy', 'Rent'].includes(property.status)) {
    errors.push('Status must be either "Buy" or "Rent"');
  }

  // If there are any errors, throw exception
  return errors
}