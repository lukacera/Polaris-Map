// property.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property, PropertyDocument } from 'src/schemas/property.schema';

interface FilterQuery {
  propertyTypes?: string[];
  minPrice?: number; 
  maxPrice?: number; 
  bedrooms?: string[];
  status?: "Rent" | "Buy";
}

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
  ) {}

  async getAllProperties(filters?: FilterQuery): Promise<Property[]> {
    const query: any = {};

    if (filters) {
      // Property Type Filter
      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        query.type = { $in: filters.propertyTypes };
      }

      // Price Range Filter
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.price = {};
        if (filters.minPrice !== undefined) {
          query.price.$gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          query.price.$lte = filters.maxPrice;
        }
      }

      // Bedrooms Filter
      if (filters.bedrooms && filters.bedrooms.length > 0) {
        if (filters.bedrooms.includes('Any')) {
          // If 'Any' is selected, don't filter by bedrooms
        } else if (filters.bedrooms.includes('3+')) {
          // Handle "3+" case
          query.rooms = {
            $or: [
              { $gte: 3 },
              { $in: filters.bedrooms.filter(b => b !== '3+').map(Number) }
            ]
          };
        } else {
          // Normal case: exact bedroom counts
          query.rooms = { $in: filters.bedrooms.map(Number) };
        }
      }
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    return this.propertyModel.find(query).exec();
  }

  // async createRandomProperties(count: number = 10): Promise<Property[]> {
  //   const randomProperties: Property[] = [];
   
  //   const getRandomNumber = (min: number, max: number) => 
  //     Math.floor(Math.random() * (max - min + 1)) + min;
   
  //   const getRandomCoordinates = () => {
  //     // BELGRADE COORDINATES
  //     const latMin = 44.7; 
  //     const latMax = 44.9;
  //     const lngMin = 20.3;
  //     const lngMax = 20.6;
      
  //     return [
  //       Number((Math.random() * (lngMax - lngMin) + lngMin).toFixed(4)), // longitude
  //       Number((Math.random() * (latMax - latMin) + latMin).toFixed(4))   // latitude
  //     ];
  //   };
   
  //   for (let i = 0; i < count; i++) {
  //     const size = getRandomNumber(30, 200);
  //     const price = getRandomNumber(50000, 300000);
   
  //     const property = {
  //       geometry: {
  //         type: 'Point',
  //         coordinates: getRandomCoordinates()
  //       },
  //       price,
  //       type: Math.random() > 0.7 ? 'House' : 'Apartment',
  //       size,
  //       rooms: getRandomNumber(1, 5),
  //       yearBuilt: getRandomNumber(1960, 2023),
  //       status: Math.random() > 0.3 ? 'Buy' : 'Rent',
  //       pricePerSquareMeter: Math.round(price / size),
  //       dataReliability: getRandomNumber(50, 100)
  //     };
   
  //     randomProperties.push(property);
  //   }
   
  //   return this.propertyModel.insertMany(randomProperties);
  // }

  async createProperty(propertyData: Partial<Property>): Promise<Property> {
    if (propertyData.price && propertyData.size && !propertyData.pricePerSquareMeter) {
      propertyData.pricePerSquareMeter = Math.round(propertyData.price / propertyData.size);
    }
  
    if (propertyData.geometry && !propertyData.geometry.type) {
      propertyData.geometry = {
        type: 'Point',
        coordinates: propertyData.geometry.coordinates || [0, 0]
      };
    }
  
    return this.propertyModel.create(propertyData);
  }
}