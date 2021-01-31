import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchModule } from '../search/search.module';

import { Orders } from './orders.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AiModule } from '../ai/ai.module';
import { OrderItem } from './order-item.entity';
import { GraingerItemsModule } from '../grainger-items/grainger-items.module';import { OrdersSearchService } from './orders-search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orders, OrderItem]),
    SearchModule,
    GraingerItemsModule,
    AiModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersSearchService],
  exports: [OrdersService],
})
export class OrdersModule {}
