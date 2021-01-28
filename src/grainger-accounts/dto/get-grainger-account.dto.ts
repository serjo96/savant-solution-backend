import { IsString } from 'class-validator';
import { BaseGraingerAccountDto } from './base-grainger-account.dto';

export class GetGraingerAccountDto extends BaseGraingerAccountDto {
  @IsString()
  id: string;
}
