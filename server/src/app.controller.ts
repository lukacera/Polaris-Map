import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Existing route
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // New route: /greet
  @Get('greet')
  getGreeting(): string {
    return 'Hello, Welcome to NestJS!';
  }

  // New route: /greet/:name
  @Get('greet/:name')
  getPersonalizedGreeting(@Param('name') name: string): string {
    return `Hello, ${name}! Welcome to NestJS!`;
  }

  // New route: /sum
  @Post('sum')
  calculateSum(@Body() numbers: { num1: number; num2: number }): number {
    console.log(numbers);
    return numbers.num1 + numbers.num2;
  }
}
