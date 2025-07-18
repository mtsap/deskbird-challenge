import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';
import { LoginDto } from './auth.controller';

@Injectable()
export class AuthService {
  login({ username, password }: LoginDto) {
    // TODO: Dummy logic — replace with actual auth logic or JWT
    if (username === 'admin' && password === 'password') {
      return ok({
        access_token: 'fake-jwt-token',
        message: 'Login successful',
      });
    }

    return err({
      message: 'Invalid username or password',
    });
  }
}
