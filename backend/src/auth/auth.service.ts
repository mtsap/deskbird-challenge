import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { err, fromThrowable, ok } from 'neverthrow';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from './auth-user.entity';
import { Repository } from 'typeorm';

const getAuthUser = (username: string) => {
  return ok({
    username: 'mtsap',
    userId: 1,
    password:
      '$argon2id$v=19$m=65536,t=3,p=1$nwIBkXVTfkGqu8hTrhJHoQ$e3k8aUl0LC0i9gVwb8hdDPJPpC8Ao/Hih1ksC+rta28',
    role: 'admin',
  });
};

type Payload = {
  sub: number;
  role: string;
};

export enum LoginErrorTypes {
  InvalidCredentials = 'Invalid Credentials',
  UserNotFound = 'User Not Found',
  JWTSigningError = 'JWT Signing Error',
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly jwtService: JwtService,
    @InjectRepository(AuthUser)
    private authUserRepository: Repository<AuthUser>,
  ) {}

  async hashPassword(plainPassword: string): Promise<string> {
    return await argon2.hash(plainPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  }
  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, plain);
  }

  async login({ username, password }: LoginDto) {
    const resultAuthUser = getAuthUser(username);
    if (resultAuthUser.isErr()) {
      this.logger.error(resultAuthUser.error);
      return err(resultAuthUser.error);
    }
    const passwordValid = await this.verifyPassword(
      password,
      resultAuthUser.value.password,
    );

    if (username === resultAuthUser.value.username && passwordValid === true) {
      const payload: Payload = {
        sub: resultAuthUser.value.userId,
        role: resultAuthUser.value.role,
      };

      const safeSign = fromThrowable(
        (p: Payload) => this.jwtService.sign(p),
        (e) => {
          this.logger.error(e);
          return {
            message: 'Failed to sign JWT token',
            type: LoginErrorTypes.JWTSigningError,
          };
        },
      );

      const tokenResult = safeSign(payload);
      if (tokenResult.isErr()) {
        return err(tokenResult.error);
      }

      return ok({
        access_token: tokenResult.value,
        message: 'Login successful',
      });
    }

    return err({
      message: 'Invalid Credentials',
      type: LoginErrorTypes.InvalidCredentials,
    });
  }
}
