import { Controller, Get } from '@nestjs/common';
import { fsReadFile } from 'ts-loader/dist/utils';

@Controller()
export class AppController {

  @Get()
  healthCheck() {
    return `Version: ${JSON.parse(fsReadFile('package.json')).version}`;
  }
}
