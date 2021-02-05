import { Controller, Get } from '@nestjs/common';
import { ConfigService } from './config/config.service';

@Controller()
export class AppController {

  constructor(private readonly configService: ConfigService) {
  }

  @Get()
  healthCheck() {
    return `Version: ${this.configService.version}`;
  }

  @Get('hello')
  testHello() {
    return 'Hello world';
  }
}
