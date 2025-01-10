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
    updatedAt: string; 
    createdAt: string; 
};
  