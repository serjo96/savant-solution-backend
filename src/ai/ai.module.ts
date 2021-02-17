import { HttpModule, Module } from '@nestjs/common';
import { AiGateway } from './ai.gateway';
import { AiService } from './ai.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from '../orders/orders.entity';

@Module({
  providers: [AiService, AiGateway],
  imports: [HttpModule, TypeOrmModule.forFeature([Orders])],
  exports: [AiService]
})
export class AiModule {}
