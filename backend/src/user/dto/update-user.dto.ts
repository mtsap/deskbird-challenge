import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
