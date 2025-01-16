import { Body, Controller, Get, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { PropertyService } from './property.service';
import { Property } from 'src/schemas/property.schema';
import { validateProperty } from 'utils/validatePropData';

interface PropertyFilters {
  propertyTypes?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  bedrooms?: string[];
}

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  async getAllProperties(@Query() query: any): Promise<Property[]> {
    // Parse and transform query parameters
    const filters: PropertyFilters = {};

    if (query.propertyTypes) {
      filters.propertyTypes = Array.isArray(query.propertyTypes)
        ? query.propertyTypes
        : [query.propertyTypes];
    }

    if (query.priceRange) {
      try {
        filters.priceRange = typeof query.priceRange === 'string'
          ? JSON.parse(query.priceRange)
          : query.priceRange;
      } catch (error) {
        throw new HttpException(
          {
            message: 'Invalid price range format',
            error: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (query.bedrooms) {
      filters.bedrooms = Array.isArray(query.bedrooms)
        ? query.bedrooms
        : [query.bedrooms];
    }

    return this.propertyService.getAllProperties(filters);
  }

  @Post()
  async createNewProperty(@Body() body: any): Promise<Property> {
    const propData: Property = body;

    console.log('Property data:', propData);
    // Validate property data
    const validationErrors = validateProperty(propData);

    // If validation fails, throw an HttpException with errors
    if (validationErrors.length > 0) {
      throw new HttpException(
        {
          message: 'Property validation failed',
          errors: validationErrors,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // If validation passes, proceed with creating the property
    return this.propertyService.createProperty(propData);
  }
}
