import { Module } from '@nestjs/common';
import { SearchModule } from '../search/search.module';
import { GraingerItemsSearchService } from './grainger-items-search.service';
import { GraingerItemsController } from './grainger-items.controller';
import { GraingerItemsService } from './grainger-items.service';
import { GraingerItem } from './grainger-items.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CsvModule } from '@shared/csv/csv.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GraingerItem]),
    CsvModule,
    SearchModule
  ],
  controllers: [GraingerItemsController],
  providers: [GraingerItemsService, GraingerItemsSearchService],
  exports: [GraingerItemsService, GraingerItemsSearchService],
})
export class GraingerItemsModule {}
