import * as dotenv from 'dotenv';
dotenv.config(); // Ovo mora biti na samom početku

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectToDB } from 'utils/connectDB';

async function bootstrap() {
  console.log("before connectToDB");
  await connectToDB();
  console.log("after connectToDB");
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();