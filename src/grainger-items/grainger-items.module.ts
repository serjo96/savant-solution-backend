import { Module } from '@nestjs/common';
import { GraingerItemsController } from './grainger-items.controller';
import { GraingerItemsService } from './grainger-items.service';
import { GraingerItem } from './grainger-items.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CsvModule } from '@shared/csv/csv.module';

@Module({
  imports: [TypeOrmModule.forFeature([GraingerItem]), CsvModule],
  controllers: [GraingerItemsController],
  providers: [GraingerItemsService],
  exports: [GraingerItemsService],
})
export class GraingerItemsModule {}
