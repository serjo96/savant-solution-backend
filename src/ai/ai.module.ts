import { HttpModule, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiGateway } from './ai.gateway';
import { AiService } from './ai.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from '../orders/orders.entity';
import { AiController } from './ai.controller';

@Module({
  providers: [AiService, AiGateway],
  imports: [HttpModule, AuthModule, TypeOrmModule.forFeature([Orders])],
  exports: [AiService],
  controllers: [AiController],
})
export class AiModule {}
