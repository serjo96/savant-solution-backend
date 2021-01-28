import { IsEmail, IsString } from 'class-validator';
import { CreateGraingerAccountDto } from './create-grainger-account.dto';

export class BaseGraingerAccountDto  {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;
}
