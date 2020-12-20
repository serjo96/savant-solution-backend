import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { CreateUserDto } from '@user/dto/create-user.dto';

import { BadRequestException } from '../common/exceptions/bad-request';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles';
import { RolesGuard } from '../common/guards/roles.guard';

import { AuthService } from './auth.service';
import { LoginByEmail } from './dto/login.dto';
import { UserWithToken } from './interfaces/user-with-token.interface';

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
  ): Promise<UserWithToken> {
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
