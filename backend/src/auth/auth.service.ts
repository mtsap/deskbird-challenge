import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  login({ username, password }: { username: string; password: string }) {
    // TODO: Dummy logic — replace with actual auth logic or JWT
    if (username === 'admin' && password === 'password') {
      return {
        access_token: 'fake-jwt-token',
        message: 'Login successful',
      };
    }

    throw new UnauthorizedException('Invalid username or password');
  }
}
