import {
  Body,
  Controller,
  Get,
  HttpCode,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { BadRequestException } from '../common/exceptions/bad-request';
import { Roles } from '../common/decorators/roles';

import { Profile, ProfileQuery } from './dto/profile.dto';
import { UsersService } from './users.service';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/current')
  @Roles('user', 'admin')
  @UseGuards(AuthGuard('jwt'))
  async profile(
    @Query() query: ProfileQuery,
    @Req() req: Request,
  ): Promise<any> {
    const { user } = req;
    const { profile } = user;

    return {
      data: {
        confirmed: user.confirmed,
        id: user.id,
        name: profile ? profile.name : '',
        email: profile ? user.email : '',
      },
    };
  }

  @Put('/current')
  @HttpCode(200)
  @Roles('user', 'admin')
  @UseGuards(AuthGuard('jwt'))
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
        confirmed: user.confirmed,
        id: user.id,
        name: profileResponse.name,
        email: profileResponse.email,
        promoEmailsSubscribed: profileResponse.promoEmailsSubscribed,
      },
    };
  }
}
