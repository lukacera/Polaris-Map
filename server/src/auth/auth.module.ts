import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from 'src/google.strategy';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { JwtStrategy } from 'src/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { 
        expiresIn: '1d' 
      },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ]),
  ],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy,
    ConfigService
  ],
  controllers: [AuthController],
  exports: [AuthService],
})

export class AuthModule {}