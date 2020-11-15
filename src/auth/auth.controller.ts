import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { UserDto } from '@user/dto/user.dto';

import { BadRequestException } from '../common/exceptions/bad-request';

import { AuthService } from './auth.service';
import { LoginStatus } from './interfaces/login-status.interface';
import { LoginByEmail } from './dto/login.dto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(200)
  public async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserDto> {
    try {
      const newUser: UserDto = await this.authService.register(createUserDto);

      return newUser;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('login')
  @HttpCode(200)
  public async login(@Body() loginUserDto: LoginByEmail): Promise<LoginStatus> {
    return await this.authService.login(loginUserDto);
  }

}
