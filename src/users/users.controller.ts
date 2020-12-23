import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
  UseInterceptors, UsePipes
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EditUserDto } from '@user/dto/edit-user.dto';
import { UserResponseDto } from '@user/dto/user-response.dto';
import { Request } from 'express';

import { User } from '@user/users.entity';

import { BadRequestException } from '../common/exceptions/bad-request';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles';
import { RolesGuard } from '../common/guards/roles.guard';
import { TransformInterceptor } from '../common/interceptors/TransformInterceptor';
import { ValidationPipe } from '../common/Pipes/validation.pipe';

import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  async getAllUsers(): Promise<User[]> {
    const data = await this.usersService.findAll({});
    console.log(data);
    return data;
  }

  @Get('/current')
  @Roles('user', 'admin')
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  async profile(
    @Req() req: Request,
  ): Promise<any> {
    const { user } = req;

    return user;
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
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
    return deletedUser;
  }

  @Put(':id')
  @Roles('admin')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  async changeUser(
    @Param() { id }: { id: string },
    @Body() body: EditUserDto,
  ): Promise<{ data: User }> {
    let editedUser;
    const updatingUser = await this.usersService.findById(id);
    if (!updatingUser) {
      throw new BadRequestException({
        message: `User doesn't exist`,
      });
    }
    try {
      console.log(body);
      editedUser = await this.usersService.editUser(id, body);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }

    return editedUser;
  }
}
