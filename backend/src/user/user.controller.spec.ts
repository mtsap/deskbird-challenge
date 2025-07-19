/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ok, err } from 'neverthrow';
import { AuthUser, UserRole } from 'src/auth/auth-user.entity';

// Mock the guards
const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
const mockRolesGuard = { canActivate: jest.fn(() => true) };

// Mock the entire User entity to avoid import issues
interface MockUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  authUser?: AuthUser;
  createdAt: Date;
  updatedAt: Date;
}

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUser: MockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    authUser: {
      id: 1,
      username: 'johndoe',
      hashedPassword: 'hashedPassword',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsers: MockUser[] = [
    mockUser,
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      authUser: {
        id: 2,
        username: 'janesmith',
        hashedPassword: 'hashedPassword',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockUserService = {
    findAll: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard('JwtAuthGuard')
      .useValue(mockJwtAuthGuard)
      .overrideGuard('RolesGuard')
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users when service succeeds', async () => {
      userService.findAll.mockResolvedValue(ok(mockUsers as User[]));

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(userService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when service returns error', async () => {
      const errorMessage = 'Database connection failed';
      userService.findAll.mockResolvedValue(err(new Error(errorMessage)));

      await expect(controller.findAll()).rejects.toThrow(
        new InternalServerErrorException(new Error(errorMessage)),
      );
      expect(userService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when service returns generic error', async () => {
      const errorMessage = new Error('Generic error');
      userService.findAll.mockResolvedValue(err(errorMessage));

      await expect(controller.findAll()).rejects.toThrow(
        new InternalServerErrorException(errorMessage),
      );
      expect(userService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'Updated John',
      lastName: 'Updated Doe',
      email: 'updated.john@example.com',
    };

    it('should return updated user when service succeeds', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      userService.update.mockResolvedValue(ok(updatedUser as User));

      const result = await controller.updateUser(1, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userNotFoundError = {
        message: 'User with ID 999 not found',
        type: 'UserNotFound' as const,
      };
      userService.update.mockResolvedValue(err(userNotFoundError));

      await expect(controller.updateUser(999, updateUserDto)).rejects.toThrow(
        new NotFoundException(userNotFoundError.message),
      );
      expect(userService.update).toHaveBeenCalledWith(999, updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when service returns generic error', async () => {
      const genericError = new Error('Database error');
      userService.update.mockResolvedValue(err(genericError));

      await expect(controller.updateUser(1, updateUserDto)).rejects.toThrow(
        new InternalServerErrorException(genericError),
      );
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when service returns string error', async () => {
      const stringError = new Error('Something went wrong');
      userService.update.mockResolvedValue(err(stringError));

      await expect(controller.updateUser(1, updateUserDto)).rejects.toThrow(
        new InternalServerErrorException(stringError),
      );
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });

    it('should properly parse id parameter', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      userService.update.mockResolvedValue(ok(updatedUser as User));

      await controller.updateUser(42, updateUserDto);

      expect(userService.update).toHaveBeenCalledWith(42, updateUserDto);
    });
  });
});
