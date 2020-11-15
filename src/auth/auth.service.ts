import { Injectable } from '@nestjs/common';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { UserDto } from '@user/dto/user.dto';
import { UsersService } from '@user/users.service';

import { BadRequestException } from '../common/exceptions/bad-request';
import { EmailService } from '../email/email.service';
import { UnauthorizedRequestException } from '../common/exceptions/unauthorized-request';

import { JwtPayload } from './passport/jwt.interface';
import { JWTService } from './jwt.service';
import { LoginStatus } from './interfaces/login-status.interface';
import { LoginByEmail } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JWTService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(payload: JwtPayload): Promise<UserDto> {
    const user = await this.usersService.findOne(payload);
    if (!user) {
      throw new UnauthorizedRequestException('Invalid token');
    }
    return user;
  }

  async register(userDto: CreateUserDto): Promise<UserDto> {
    let user;
    try {
      user = await this.usersService.create(userDto);
    } catch (err) {
      throw new Error(err);
    }
    return user;
  }

  async login(loginUserDto: LoginByEmail): Promise<LoginStatus> {
    const user = await this.usersService.findOne(loginUserDto);

    const token = this.jwtService.createUserToken(user);

    return {
      email: user.email,
      ...token,
    };
  }

  async createEmailToken(email: string): Promise<boolean> {
    const emailVerification = await this.emailService.findOne({ email });
    const verificationExpires =
      (new Date().getTime() - emailVerification.timestamp.getTime()) / 60000 <
      15;

    if (emailVerification && verificationExpires) {
      throw new BadRequestException('Email sent recently');
    } else {
      const emailToken = await this.jwtService.createToken();

      await this.emailService.save({
        email,
        emailToken, // Generate 7 digits number
        timestamp: new Date(),
      });
    }
    return true;
  }
}
