import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailService } from './email.service';
import { EmailVerificationEntity } from './email-verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerificationEntity])],
  providers: [EmailService],
  exports: [EmailService, TypeOrmModule],
})
export class EmailModule {}
