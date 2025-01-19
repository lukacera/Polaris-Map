import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { PropertyModule } from './property/property.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { VoteModule } from './vote/vote.module';
import { VoteController } from './vote/vote.controller';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL),
    ConfigModule.forRoot(),
    PropertyModule,
    AuthModule,
    VoteModule
  ],
  controllers: [AuthController, VoteController],
  providers: [AppService],
})
export class AppModule {}
