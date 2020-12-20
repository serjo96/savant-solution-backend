import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserResponseDto } from '@user/dto/user-response.dto';

import { AuthService } from '../auth.service';
import { ConfigService } from '../../config/config.service';

import { JwtPayload } from './jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.jwtConfig.secretCode,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<UserResponseDto> {
    const user = await this.authService.validateUserToken(payload);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
