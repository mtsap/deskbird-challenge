import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from './auth-user.entity';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret',
    });
  }

  validate(payload: JwtPayload): Promise<Partial<AuthUser>> {
    return Promise.resolve({
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    } as Partial<AuthUser>);
  }
}
