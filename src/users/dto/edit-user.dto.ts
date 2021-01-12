import { Exclude, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { RolesEnum } from '@user/users.entity';

export class EditUserDto {
  @IsEmail() email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  password?: string;

  @Transform((status) => RolesEnum[status])
  @IsEnum(RolesEnum)
  roles: RolesEnum;
}
