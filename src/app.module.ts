import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { LogLevel } from '@sentry/types';

import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { GraingerItemsModule } from './grainger-items/grainger-items.module';
import { OrdersModule } from './orders/orders.module';
import { SearchModule } from './search/search.module';
import { AiModule } from './ai/ai.module';
import { GraingerAccountsModule } from './grainger-accounts/grainger-accounts.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    LoggerModule.forRoot(),
    TypeOrmModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    SentryModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (cfg: ConfigService) => ({
        dsn: cfg.sentryDns,
        debug: true,
        enabled: Boolean(cfg.sentryDns),
        environment: cfg.nodeEnv,
        tracesSampleRate: 1.0,
        release: cfg.version,
        logLevel: LogLevel.Debug,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ConfigModule,
    GraingerItemsModule,
    OrdersModule,
    SearchModule,
    AiModule,
    GraingerAccountsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
