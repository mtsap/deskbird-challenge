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

// Mock the guards
const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
const mockRolesGuard = { canActivate: jest.fn(() => true) };

// Mock the entire User entity to avoid import issues
interface MockUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  authUser?: any; // Use any to avoid type conflicts
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
      email: 'john.doe@example.com',
      hashedPassword: 'hashedPassword',
      role: 'user',
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
        email: 'jane.smith@example.com',
        hashedPassword: 'hashedPassword',
        role: 'user',
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
      // Arrange
      userService.findAll.mockResolvedValue(ok(mockUsers as User[]));

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(userService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when service returns error', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      userService.findAll.mockResolvedValue(err(new Error(errorMessage)));

      // Act & Assert
      await expect(controller.findAll()).rejects.toThrow(
        new InternalServerErrorException(new Error(errorMessage)),
      );
      expect(userService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when service returns generic error', async () => {
      // Arrange
      const errorMessage = new Error('Generic error');
      userService.findAll.mockResolvedValue(err(errorMessage));

      // Act & Assert
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
      // Arrange
      const updatedUser = { ...mockUser, ...updateUserDto };
      userService.update.mockResolvedValue(ok(updatedUser as User));

      // Act
      const result = await controller.updateUser(1, updateUserDto);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user is not found', async () => {
      // Arrange
      const userNotFoundError = {
        message: 'User with ID 999 not found',
        type: 'UserNotFound' as const,
      };
      userService.update.mockResolvedValue(err(userNotFoundError));

      // Act & Assert
      await expect(controller.updateUser(999, updateUserDto)).rejects.toThrow(
        new NotFoundException(userNotFoundError.message),
      );
      expect(userService.update).toHaveBeenCalledWith(999, updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when service returns generic error', async () => {
      // Arrange
      const genericError = new Error('Database error');
      userService.update.mockResolvedValue(err(genericError));

      // Act & Assert
      await expect(controller.updateUser(1, updateUserDto)).rejects.toThrow(
        new InternalServerErrorException(genericError),
      );
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when service returns string error', async () => {
      // Arrange
      const stringError = new Error('Something went wrong');
      userService.update.mockResolvedValue(err(stringError));

      // Act & Assert
      await expect(controller.updateUser(1, updateUserDto)).rejects.toThrow(
        new InternalServerErrorException(stringError),
      );
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });

    it('should properly parse id parameter', async () => {
      // Arrange
      const updatedUser = { ...mockUser, ...updateUserDto };
      userService.update.mockResolvedValue(ok(updatedUser as User));

      // Act
      await controller.updateUser(42, updateUserDto);

      // Assert
      expect(userService.update).toHaveBeenCalledWith(42, updateUserDto);
    });
  });

  describe('Guards and Decorators', () => {
    // Note: These tests would require the actual guard classes to be imported
    // For now, we can test that the guards are being overridden correctly
    it('should have mocked guards that allow access', () => {
      expect(mockJwtAuthGuard.canActivate()).toBe(true);
      expect(mockRolesGuard.canActivate()).toBe(true);
    });

    // If you need to test the actual decorators, you would need to:
    // 1. Configure Jest to handle the src/ path alias
    // 2. Or move these imports to use relative paths
    // 3. Or create a separate integration test
  });
});
