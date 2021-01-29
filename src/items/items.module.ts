import { Module } from '@nestjs/common';
import { SearchModule } from '../search/search.module';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { Item } from './items.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    SearchModule,
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
