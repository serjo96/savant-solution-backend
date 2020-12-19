import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { UserDto } from '@user/dto/user.dto';
import { UsersService } from '@user/users.service';

import { BadRequestException } from '../common/exceptions/bad-request';
import { Roles } from '../common/decorators/roles';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

import { AuthService } from './auth.service';
import { LoginStatus } from './interfaces/login-status.interface';
import { LoginByEmail } from './dto/login.dto';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('/register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  public async register(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request
  ): Promise<LoginStatus> {
    try {
      return await this.authService.register(createUserDto);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  public async login(@Body() login: LoginByEmail) {
    try {
      return await this.authService.login(login);
    } catch (error) {
      throw new BadRequestException(error);
    }

  }
}
