import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginErrorTypes } from './errors/login-error-types';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    if (result.isErr()) {
      const error = result.error;

      switch (error.type) {
        case LoginErrorTypes.InvalidCredentials:
          throw new UnauthorizedException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }

    return result.value;
  }
}
export { LoginDto };
