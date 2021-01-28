import { Exclude } from 'class-transformer';
import { BaseGraingerAccountDto } from './base-grainger-account.dto';

export class CreateGraingerAccountDto extends BaseGraingerAccountDto {
  @Exclude()
  id: string;
}
