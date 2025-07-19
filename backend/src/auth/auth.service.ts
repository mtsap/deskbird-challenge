import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { err, fromThrowable, ok, Result } from 'neverthrow';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from './auth-user.entity';
import { Repository } from 'typeorm';
import { LoginErrorTypes } from './errors/login-error-types';

type Payload = {
  sub: number;
  role: string;
};

export type LoginSuccess = {
  access_token: string;
  message: string;
};

export type LoginError = {
  message: string;
  type: LoginErrorTypes;
};

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

  async getAuthUserByUsername(username: string) {
    try {
      const authUser = await this.authUserRepository.findOne({
        where: { username },
      });
      if (!authUser) {
        return err({
          message: 'User not found',
          type: LoginErrorTypes.UserNotFound,
        });
      }
      return ok(authUser);
    } catch (error) {
      this.logger.error(error);
      return err(error);
    }
  }

  async login({
    username,
    password,
  }: LoginDto): Promise<Result<LoginSuccess, LoginError>> {
    const resultAuthUser = await this.getAuthUserByUsername(username);
    if (resultAuthUser.isErr()) {
      return err(resultAuthUser.error);
    }
    const passwordValid = await this.verifyPassword(
      password,
      resultAuthUser.value.hashedPassword,
    );

    if (username === resultAuthUser.value.username && passwordValid === true) {
      const payload: Payload = {
        sub: resultAuthUser.value.id,
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
