// property.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property, PropertyDocument } from 'src/schemas/property.schema';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
  ) {}

  async getAllProperties(): Promise<Property[]> {
    return this.propertyModel.find();
  }

  async createRandomProperties(count: number = 10): Promise<Property[]> {
    const randomProperties: Property[] = [];
   
    const getRandomNumber = (min: number, max: number) => 
      Math.floor(Math.random() * (max - min + 1)) + min;
   
    // Helper funkcija za random koordinate oko Beograda
    const getRandomCoordinates = () => {
      // Beograd aproksimativne granice
      const latMin = 44.7; 
      const latMax = 44.9;
      const lngMin = 20.3;
      const lngMax = 20.6;
      
      return [
        Number((Math.random() * (lngMax - lngMin) + lngMin).toFixed(4)), // longitude
        Number((Math.random() * (latMax - latMin) + latMin).toFixed(4))   // latitude
      ];
    };
   
    for (let i = 0; i < count; i++) {
      const size = getRandomNumber(30, 200);
      const price = getRandomNumber(50000, 300000);
   
      const property = {
        geometry: {
          type: 'Point',
          coordinates: getRandomCoordinates()
        },
        price,
        type: Math.random() > 0.7 ? 'House' : 'Apartment',
        size,
        rooms: getRandomNumber(1, 5),
        yearBuilt: getRandomNumber(1960, 2023),
        status: Math.random() > 0.3 ? 'Buy' : 'Rent',
        pricePerSquareMeter: Math.round(price / size)
      };
   
      randomProperties.push(property);
    }
   
    return this.propertyModel.insertMany(randomProperties);
  }
}