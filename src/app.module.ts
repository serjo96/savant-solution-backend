import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { ItemsModule } from './items/items.module';
import { OrdersModule } from './orders/orders.module';
import { AiModule } from './ai/ai.module';
import { GraingerAccountsModule } from './grainger-accounts/grainger-accounts.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    LoggerModule.forRoot(),
    TypeOrmModule.forRoot(),
    AuthModule,
    ConfigModule,
    ItemsModule,
    OrdersModule,
    AiModule,
    ScheduleModule.forRoot(),
    GraingerAccountsModule,
  ],
  controllers: [AppController]
})
export class AppModule {}
