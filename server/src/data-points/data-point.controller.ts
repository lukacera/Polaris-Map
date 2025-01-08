import { Controller, Get } from '@nestjs/common';
import { DataPointService } from './data-point.service';

@Controller('data-points')
export class DataPointController {
  constructor(private readonly dataPointsService: DataPointService) {}

  @Get()
    getAll(): string {
      return 'All data points';
    }
}
