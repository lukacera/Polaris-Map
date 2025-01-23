// property.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property, PropertyDocument } from 'src/schemas/property.schema'
import { PropFilterQuery } from 'src/types/PropFilterQuery';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
  ) {}

  async getAllProperties(filters?: PropFilterQuery): Promise<Property[]> {
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

      if (filters.rooms && filters.rooms.length > 0) {
        if (filters.rooms.includes('Any')) {
          // If 'Any' is selected, don't filter by rooms
        } else if (filters.rooms.includes('3+')) {
          // Handle "3+" case
          query.rooms = {
            $or: [
              { $gte: 3 },
              { $in: filters.rooms.filter(b => b !== '3+').map(Number) }
            ]
          };
        } else {
          // Normal case: exact bedroom counts
          query.rooms = { $in: filters.rooms.map(Number) };
        }
      }
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    return this.propertyModel.find(query).exec();
  }

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