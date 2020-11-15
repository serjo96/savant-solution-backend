import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class ProfileQuery {
  @IsOptional()
  includes: string[];
}

export class Profile {
  @IsOptional()
  @IsString({
    message: 'Необходимо указать имя',
  })
  name?: string;

  @IsOptional()
  @IsEmail(
    {},
    {
      message: 'Неправильный формат электронной почты',
    },
  )
  email?: string;

  @IsOptional()
  @IsBoolean()
  promoEmailsSubscribed?: boolean;
}
