import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { UserDto } from '@user/dto/user.dto';
import { UsersService } from '@user/users.service';

import { JwtPayload } from './passport/jwt.interface';
import { JWTService } from './jwt.service';
import { LoginStatus } from './interfaces/login-status.interface';
import { LoginByEmail } from './dto/login.dto';
import { UserResponseDto } from './dto/user.dto';

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

    // tslint:disable-next-line: no-string-literal
    const { password, ...result } = user;
    return result;
  }

  async comparePassword(attempt: string, dbPassword: string): Promise<boolean> {
    return await bcrypt.compare(attempt, dbPassword);
  }

  async validateUserToken(payload: JwtPayload): Promise<UserDto> {
    return await this.userService.findById(payload.id);
  }

  async register(userDto: CreateUserDto): Promise<UserDto> {
    let user;
    try {
      user = await this.userService.create(userDto);
    } catch (err) {
      throw new Error(err);
    }
    return user;
  }

  async login(loginUserDto: LoginByEmail): Promise<LoginStatus> {
    const user = await this.userService.findByEmail(loginUserDto.email);
    const token = this.jwtService.createUserToken(user);

    return {
      user: new UserResponseDto(user),
      token,
    };
  }
}
