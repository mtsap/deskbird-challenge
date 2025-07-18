import { Injectable } from '@nestjs/common';
import { err, fromThrowable, ok } from 'neverthrow';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login({ username, password }: LoginDto) {
    // TODO: Dummy logic — replace with actual auth logic or JWT
    if (username === 'admin' && password === 'password') {
      const payload = { sub: 1, userId: 1 };

      const safeSign = fromThrowable(
        (p: any) => this.jwtService.sign(p),
        () => ({ message: 'Failed to sign JWT token' }),
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
      message: 'Invalid username or password',
    });
  }
}
