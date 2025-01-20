export type Property = {
    _id: string; 
    geometry: {
        type: 'Point';
        coordinates: [number, number]; 
    };
    price: number;
    pricePerSquareMeter: number;
    rooms: number;
    size: number;  
    status: 'Buy' | 'Rent';  
    type: 'Apartment' | 'House';
    yearBuilt: number;
    dataReliability: number;
    numberOfReviews: number;

    updatedAt: string; 
    createdAt: string; 
};

export type CustomProperty = Omit<Property, "_id"> & {
  id: string;
};