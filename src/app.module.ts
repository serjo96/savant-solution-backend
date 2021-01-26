import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { ItemsModule } from './items/items.module';
import { OrdersModule } from './orders/orders.module';
import { GraingerAccountsModule } from './grainger-accounts/grainger-accounts.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    LoggerModule.forRoot(),
    TypeOrmModule.forRoot(),
    AuthModule,
    ConfigModule,
    ItemsModule,
    OrdersModule,
    GraingerAccountsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
