import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchModule } from '../search/search.module';
import { OrdersSearchService } from './orders-search.service';

import { Orders } from './orders.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AiModule } from '../ai/ai.module';
import { OrderItem } from './order-item.entity';
import { GraingerItemsModule } from '../grainger-items/grainger-items.module';
import { CsvModule } from '@shared/csv/csv.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orders, OrderItem]),
    SearchModule,
    AiModule,
    CsvModule,
    GraingerItemsModule,
    AiModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersSearchService],
  exports: [OrdersService],
})
export class OrdersModule {
  constructor(private searchService: OrdersSearchService) {}
  async onModuleInit() {
    await this.searchService.createIndex()
  }
}
