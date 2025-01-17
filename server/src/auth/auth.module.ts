import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from 'src/google.strategy';

@Module({
  imports: [
    UsersModule, // Module for managing users
    ConfigModule, // To use environment variables for client ID, secret, etc.
  ],
  providers: [
    AuthService, // Custom authentication logic
    GoogleStrategy, // Register the Google strategy
  ],
  exports: [AuthService], // Export AuthService if used in other modules
})
export class AuthModule {}
