import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from '@user/dto/user-response.dto';

import { ConfigService } from '../config/config.service';

import { IJwtPayload } from './passport/jwt.interface';

@Injectable()
export class JWTService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  createUserToken({ email, roles, id }: UserResponseDto): any {
    const expiresIn = this.configService.jwtConfig.expiresIn;

    const user: IJwtPayload = { email, roles, id };
    const accessToken = this.jwtService.sign(user);
    return {
      expiresIn,
      accessToken,
    };
  }

  verifyToken(token: string) {
    return this.jwtService.verify(token);
  }

  createToken() {
    return this.jwtService.sign({});
  }
}
