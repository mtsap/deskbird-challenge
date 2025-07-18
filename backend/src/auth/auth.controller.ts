import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService, LoginErrorTypes } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    if (result.isErr()) {
      if (result.error.type === LoginErrorTypes.InvalidCredentials) {
        throw new UnauthorizedException(result.error.message);
      }
      throw new InternalServerErrorException(result.error.message);
    }

    return result.value;
  }
}
export { LoginDto };
