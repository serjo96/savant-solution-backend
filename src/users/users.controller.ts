import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { EditUserDto } from '@user/dto/edit-user.dto';
import { UserResponseDto } from '@user/dto/user-response.dto';
import { Request } from 'express';

import { User } from '@user/users.entity';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles';
import { RolesGuard } from '../common/guards/roles.guard';
import { TransformInterceptor } from '../common/interceptors/TransformInterceptor';
import { ValidationPipe } from '../common/Pipes/validation.pipe';

import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(new SentryInterceptor())
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll({});
  }

  @Get('/current')
  @Roles('user', 'admin')
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  async profile(@Req() req: Request): Promise<any> {
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
  ): Promise<any> {
    const { user } = req;
    if (user.id === id) {
      throw new HttpException('You can delete yourself', HttpStatus.OK);
    }
    return this.usersService.removeUser(id);
  }

  @Put(':id')
  @Roles('admin')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  async changeUser(
    @Param() { id }: { id: string },
    @Body() body: EditUserDto,
  ): Promise<{ data: User }> {
    const updatingUser = await this.usersService.findById(id);
    if (!updatingUser) {
      throw new HttpException(`User doesn't exist`, HttpStatus.OK);
    }

    const userEmail = body.email;
    if (userEmail) {
      const existEmail = await this.usersService.findByEmail(userEmail);
      if (existEmail && existEmail.id !== updatingUser.id) {
        throw new HttpException(
          `User with current email already exist`,
          HttpStatus.OK,
        );
      }
    }

    let editedUser;
    try {
      editedUser = await this.usersService.editUser(id, body);
    } catch (error) {
      throw new HttpException(error, HttpStatus.OK);
    }

    return editedUser;
  }
}
