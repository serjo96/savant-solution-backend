import {
  Body,
  Controller, Delete,
  Get,
  HttpCode, Param,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { User } from '@user/users.entity';

import { BadRequestException } from '../common/exceptions/bad-request';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles';
import { RolesGuard } from '../common/guards/roles.guard';

import { Profile, ProfileQuery } from './dto/profile.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  async getAllUsers(): Promise<{ data: User[] }> {
    const data = await this.usersService.findAll({});
    return {
      data
    };
  }

  @Get('/current')
  @Roles('user', 'admin')
  async profile(
    @Query() query: ProfileQuery,
    @Req() req: Request,
  ): Promise<any> {
    const { user } = req;
    const { profile } = user;

    return {
      data: {
        id: user.id,
        name: profile ? profile.name : '',
        email: profile ? user.email : '',
      },
    };
  }

  @Put('/current')
  @HttpCode(200)
  @Roles('user', 'admin')
  async updateProfile(
    @Body() body: Profile,
    @Req() req: Request,
  ): Promise<any> {
    const { user } = req;

    const profileResponse = await this.usersService.saveProfile(user, body);
    if (profileResponse.error) {
      throw new BadRequestException({
        target: {},
        property: '_global',
        children: '',
        constraints: {
          profileError: profileResponse.data,
        },
      });
    }

    return {
      data: {
        id: user.id,
        name: profileResponse.name,
        email: profileResponse.email,
      },
    };
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'))
    async removeUser(@Param() {id}: {id: string}, @Req() req: Request) {
    const { user } = req;
    if (user.id === id) {
      throw new BadRequestException({
        message: 'You can delete yourself'
      });
    }
  }
}
