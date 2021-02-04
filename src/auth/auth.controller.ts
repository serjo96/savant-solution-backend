import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CreateUserDto } from '@user/dto/create-user.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles';
import { RolesGuard } from '../common/guards/roles.guard';

import { AuthService } from './auth.service';
import { LoginByEmail } from './dto/login.dto';
import { UserWithToken } from './interfaces/user-with-token.interface';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  public async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserWithToken> {
    return this.authService.register(createUserDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  public async login(@Body() login: LoginByEmail) {
    return this.authService.login(login);
  }
}
