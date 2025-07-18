import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('/status')
  status(): { status: string; timestamp: number } {
    return { status: 'ok', timestamp: Date.now() };
  }
}
