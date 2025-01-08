import { Controller, Get } from '@nestjs/common';
import { PropertyService } from './property.service';
import { Property } from 'src/schemas/property.schema';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  async getAllProperties(): Promise<Property[]> {
    return this.propertyService.getAllProperties(); // Poziva metod iz servisa
  }
}
