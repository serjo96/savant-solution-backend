import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserResponseDto } from '@user/dto/user-response.dto';
import { Request } from 'express';

import { User } from '@user/users.entity';

import { BadRequestException } from '../common/exceptions/bad-request';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles';
import { RolesGuard } from '../common/guards/roles.guard';
import { TransformInterceptor } from '../common/interceptors/TransformInterceptor';

import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  async getAllUsers(): Promise<User[]> {
    return await this.usersService.findAll({});
  }

  @Get('/current')
  @Roles('user', 'admin')
  async profile(
    @Req() req: Request,
  ): Promise<any> {
    const { user } = req;

    return {
      data: user,
    };
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'))
  async removeUser(
    @Param() { id }: { id: string },
    @Req() req: Request,
  ): Promise<{ data: User[] }> {
    const { user } = req;
    let deletedUser;
    if (user.id === id) {
      throw new BadRequestException({
        message: 'You can delete yourself',
      });
    }
    try {
      await this.usersService.removeUser(id);
      deletedUser = await this.usersService.findById(id, { withDeleted: true });
    } catch (error) {
      throw new BadRequestException(error);
    }
    return {
      data: deletedUser,
    };
  }

  @Put(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'))
  async changeUser(
    @Param() { id }: { id: string },
    @Body() body: User,
  ): Promise<{ data: User }> {
    let editedUser;
    const updatingUser = await this.usersService.findById(id);
    if (!updatingUser) {
      throw new BadRequestException({
        message: `User doesn't exist`,
      });
    }
    try {
      editedUser = await this.usersService.editUser(id, body);
    } catch (error) {
      throw new BadRequestException(error);
    }

    return {
      data: editedUser,
    };
  }
}
