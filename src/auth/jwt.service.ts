import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { UserDto } from '@user/dto/user.dto';

import { ConfigService } from '../config/config.service';

import { JwtPayload } from './passport/jwt.interface';

@Injectable()
export class JWTService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  createUserToken({ email, roles, id }: UserDto): any {
    const expiresIn = this.configService.jwtConfig.expiresIn;

    const user: JwtPayload = { email, roles, id };
    const accessToken = this.jwtService.sign(user);
    return {
      expiresIn,
      accessToken,
    };
  }

  createToken() {
    return this.jwtService.sign({});
  }
}
