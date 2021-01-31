import { Module } from '@nestjs/common';
import { CsvService } from '@shared/csv/csv.service';

@Module({
  providers: [CsvService],
  exports: [CsvService],
})
export class CsvModule {
}
