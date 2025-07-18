import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';

@Injectable()
export class AuthService {
  login({ username, password }: { username: string; password: string }) {
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
