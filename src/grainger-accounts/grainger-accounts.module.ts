import { Module } from '@nestjs/common';
import { GraingerAccountsController } from './grainger-accounts.controller';
import { GraingerAccountsService } from './grainger-accounts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraingerAccount } from './grainger-account.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([GraingerAccount]), AiModule],
  controllers: [GraingerAccountsController],
  providers: [GraingerAccountsService]
})
export class GraingerAccountsModule {}
