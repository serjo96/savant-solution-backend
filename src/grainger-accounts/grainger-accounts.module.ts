import { Module } from '@nestjs/common';
import { GraingerAccountsController } from './grainger-accounts.controller';
import { GraingerAccountsService } from './grainger-accounts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraingerAccount } from './grainger-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GraingerAccount])],
  controllers: [GraingerAccountsController],
  providers: [GraingerAccountsService]
})
export class GraingerAccountsModule {}
