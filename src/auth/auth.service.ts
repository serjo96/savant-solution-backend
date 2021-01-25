import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserResponseDto } from '@user/dto/user-response.dto';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { UsersService } from '@user/users.service';
import { BadRequestException } from '../common/exceptions/bad-request';
import { UserClassResponseDto } from './dto/user.dto';

import { IJwtPayload } from './passport/jwt.interface';
import { JWTService } from './jwt.service';
import { UserWithToken } from './interfaces/user-with-token.interface';
import { LoginByEmail } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JWTService,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  async validateUser(username: string, pass: string) {
    // find if user exist with this email
    const user = await this.userService.findByEmail(username);
    if (!user) {
      return null;
    }

    // find if user password match
    const match = await this.comparePassword(pass, user.password);
    if (!match) {
      return null;
    }

    const { password, ...result } = user;
    return result;
  }

  async comparePassword(attempt: string, dbPassword: string): Promise<boolean> {
    return await bcrypt.compare(attempt, dbPassword);
  }

  async validateUserToken(payload: IJwtPayload): Promise<UserResponseDto> {
    return await this.userService.findById(payload.id);
  }

  async register(userDto: CreateUserDto): Promise<UserWithToken> {
    let user = null;
    let token = null;
    const existUser = await this.userService.findByEmail(userDto.email);
    if (existUser) {
      throw new HttpException(`User already exist`, HttpStatus.OK);
    }
    try {
      user = await this.userService.create(userDto);
      token = this.jwtService.createUserToken(user);
    } catch (err) {
      throw new BadRequestException(err);
    }
    return {
      user: new UserClassResponseDto(user),
      token,
    };
  }

  async login(loginUserDto: LoginByEmail): Promise<UserWithToken> {
    const user = await this.userService.findByEmail(loginUserDto.email);
    if (!user) {
      throw new BadRequestException({ message: `User doesn't exist` });
    }
    const token = this.jwtService.createUserToken(user);

    return {
      user: new UserClassResponseDto(user),
      token,
    };
  }
}
