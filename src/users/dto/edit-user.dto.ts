
import { Exclude, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';

import { RolesEnum } from '@user/users.entity';

export class EditUserDto {
  @IsEmail() email?: string;
  @IsString() name?: string;

  @IsString()
  password?: string;

  @Transform((status) => RolesEnum[status])
  @IsEnum(RolesEnum)
  roles: RolesEnum;
}
