import { Body, Controller, Get, Post } from '@nestjs/common';
import { PropertyService } from './property.service';
import { Property } from 'src/schemas/property.schema';

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
    return this.propertyService.createProperty(propData);
  }

  // @Post("default")
  // async createDefaultProperties(): Promise<Property[]> {
  //   return this.propertyService.createRandomProperties();
  // }
}
