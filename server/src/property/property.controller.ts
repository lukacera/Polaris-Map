import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { PropertyService } from './property.service';
import { Property } from 'src/schemas/property.schema';
import { validateProperty } from 'utils/validatePropData';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  async getAllProperties(): Promise<Property[]> {
    return this.propertyService.getAllProperties();
  }

  @Post()
  async createNewProperty(@Body() body: any): Promise<Property> {
    const propData: Property = body;

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


  // @Post("default")
  // async createDefaultProperties(): Promise<Property[]> {
  //   return this.propertyService.createRandomProperties();
  // }
}
