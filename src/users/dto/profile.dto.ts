import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class ProfileQuery {
  @IsOptional()
  includes: string[];
}

export class Profile {
  @IsOptional()
  @IsString({
    message: 'Name is required',
  })
  name?: string;

  @IsOptional()
  @IsEmail(
    {},
    {
      message: 'Invalid email format',
    },
  )
  email?: string;
}
