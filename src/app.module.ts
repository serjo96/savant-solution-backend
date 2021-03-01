import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
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
    AuthModule,
    ConfigModule,
    GraingerItemsModule,
    OrdersModule,
    SearchModule,
    GraingerAccountsModule,
  ],
  controllers: [AppController]
})
export class AppModule {}
