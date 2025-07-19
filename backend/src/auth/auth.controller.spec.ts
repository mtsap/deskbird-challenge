/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService, LoginError, LoginSuccess } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginErrorTypes } from './errors/login-error-types';
import { AuthUser } from './auth-user.entity';
import { err, ok } from 'neverthrow';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  // Mock AuthService
  const mockAuthService = {
    login: jest.fn(),
    hashPassword: jest.fn(),
    verifyPassword: jest.fn(),
    getAuthUserByUsername: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        // Mock all AuthService dependencies to prevent instantiation issues
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AuthUser),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const validLoginDto: LoginDto = {
      username: 'testuser',
      password: 'testpassword',
    };

    const successResponse: LoginSuccess = {
      access_token: 'mock-jwt-token',
      message: 'Login successful',
    };

    it('should return access token when login is successful', async () => {
      authService.login.mockResolvedValue(ok(successResponse));

      const result = await controller.login(validLoginDto);

      expect(authService.login).toHaveBeenCalledWith(validLoginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(successResponse);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const invalidCredentialsError: LoginError = {
        message: 'Invalid Credentials',
        type: LoginErrorTypes.InvalidCredentials,
      };
      authService.login.mockResolvedValue(err(invalidCredentialsError));

      await expect(controller.login(validLoginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid Credentials'),
      );
      expect(authService.login).toHaveBeenCalledWith(validLoginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const userNotFoundError: LoginError = {
        message: 'User not found',
        type: LoginErrorTypes.UserNotFound,
      };
      authService.login.mockResolvedValue(err(userNotFoundError));

      await expect(controller.login(validLoginDto)).rejects.toThrow(
        new UnauthorizedException('User not found'),
      );
      expect(authService.login).toHaveBeenCalledWith(validLoginDto);
    });

    it('should throw InternalServerErrorException for JWT signing errors', async () => {
      const jwtSigningError: LoginError = {
        message: 'Failed to sign JWT token',
        type: LoginErrorTypes.JWTSigningError,
      };
      authService.login.mockResolvedValue(err(jwtSigningError));

      await expect(controller.login(validLoginDto)).rejects.toThrow(
        new InternalServerErrorException('Failed to sign JWT token'),
      );
      expect(authService.login).toHaveBeenCalledWith(validLoginDto);
    });

    it('should throw InternalServerErrorException for unknown error types', async () => {
      const unknownError: LoginError = {
        message: 'Unknown error occurred',
        type: 'UNKNOWN_ERROR' as LoginErrorTypes, // Simulating an unknown error type
      };
      authService.login.mockResolvedValue(err(unknownError));

      await expect(controller.login(validLoginDto)).rejects.toThrow(
        new InternalServerErrorException('Unknown error occurred'),
      );
      expect(authService.login).toHaveBeenCalledWith(validLoginDto);
    });

    it('should handle empty login DTO', async () => {
      const emptyLoginDto: LoginDto = {
        username: '',
        password: '',
      };
      const invalidCredentialsError: LoginError = {
        message: 'Invalid Credentials',
        type: LoginErrorTypes.InvalidCredentials,
      };
      authService.login.mockResolvedValue(err(invalidCredentialsError));

      await expect(controller.login(emptyLoginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid Credentials'),
      );
      expect(authService.login).toHaveBeenCalledWith(emptyLoginDto);
    });

    it('should handle service throwing unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected service error');
      authService.login.mockRejectedValue(unexpectedError);

      await expect(controller.login(validLoginDto)).rejects.toThrow(
        unexpectedError,
      );
      expect(authService.login).toHaveBeenCalledWith(validLoginDto);
    });
  });

  describe('controller instantiation', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have authService injected', () => {
      expect(controller['authService']).toBeDefined();
    });
  });
});
