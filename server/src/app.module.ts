import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataPointModule } from './data-points/data-point.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL),
    DataPointModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
