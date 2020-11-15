import { Global, Module } from '@nestjs/common';

import { ConfigService } from './config.service';
import { CONFIG_FILE } from './constants';

@Module({
  exports: [ConfigService],
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(CONFIG_FILE),
    },
  ],
})
@Global()
export class ConfigModule {}
