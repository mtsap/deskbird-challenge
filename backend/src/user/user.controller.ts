import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/auth/auth-user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users returned' })
  async findAll(): Promise<User[]> {
    const users = await this.userService.findAll();
    if (users.isErr()) {
      throw new InternalServerErrorException(users.error);
    }
    return users.value;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const result = await this.userService.update(id, updateUserDto);

    if (result.isOk()) {
      return result.value;
    } else {
      const error = result.error;

      if (
        typeof error !== 'string' &&
        'type' in error &&
        error.type === 'UserNotFound'
      ) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }
}
