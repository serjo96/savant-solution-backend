import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Orders } from './orders.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AiModule } from '../ai/ai.module';
import { OrderItem } from './order-item.entity';
import { GraingerItemsModule } from '../grainger-items/grainger-items.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orders, OrderItem]),
    AiModule,
    GraingerItemsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
