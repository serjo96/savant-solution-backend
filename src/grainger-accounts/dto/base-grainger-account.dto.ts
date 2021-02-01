import { IsString } from 'class-validator';

export class BaseGraingerAccountDto  {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;
}
