// users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService] // Važno: moramo eksportovati UsersService
})
export class UsersModule {}