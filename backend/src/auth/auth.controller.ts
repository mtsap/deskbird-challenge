import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: { username: string; password: string }) {
    const result = this.authService.login(loginDto);
    if (result.isErr()) {
      throw new UnauthorizedException(result.error.message);
    }

    return result.value;
  }
}
