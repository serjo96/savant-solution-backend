import { Body, Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { UserDto } from '@user/dto/user.dto';
import { UsersService } from '@user/users.service';

import { BadRequestException } from '../common/exceptions/bad-request';
import { Roles } from '../common/decorators/roles';

import { AuthService } from './auth.service';
import { LoginStatus } from './interfaces/login-status.interface';
import { LoginByEmail } from './dto/login.dto';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/register')
  @Roles('admin')
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

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  public async login(@Request() req, @Body() login: LoginByEmail) {
    return await this.authService.login(req.user);
  }
}
