import { Module } from '@nestjs/common';
import { DataPointController } from './data-point.controller';
import { DataPointService } from './data-point.service';

@Module({
  controllers: [DataPointController],
  providers: [DataPointService]
})
export class DataPointModule {}
