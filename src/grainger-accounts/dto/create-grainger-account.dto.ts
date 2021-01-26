import {
  Entity,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

@Entity('grainger-account')
export class CreateGraingerAccountDto {
  @Exclude()
  id?: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  public name: string;
}
