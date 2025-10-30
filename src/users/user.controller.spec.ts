import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRole } from './user.model';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    findOne: jest.fn(),
    updateProfile: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    toResponseDto: jest.fn(),
    toListResponse: jest.fn(),
  };

  const mockRequest = {
    user: {
      userId: 'user-123',
      email: 'test@example.com',
      role: UserRole.AGENT,
    },
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
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockResponse = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockUserService.toResponseDto.mockReturnValue(mockResponse);

      const result = await controller.getProfile(mockRequest as any);

      expect(mockUserService.findOne).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockResponse);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(controller.getProfile(mockRequest as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateDto = {
        name: 'Updated Name',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: updateDto.name,
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.updateProfile.mockResolvedValue(mockUser);
      mockUserService.toResponseDto.mockReturnValue(mockUser);

      const result = await controller.updateProfile(mockRequest as any, updateDto);

      expect(mockUserService.updateProfile).toHaveBeenCalledWith(
        'user-123',
        updateDto,
      );
      expect(result).toBeDefined();
    });
  });

  describe('removeProfile', () => {
    it('should remove user profile', async () => {
      mockUserService.remove.mockResolvedValue(undefined);

      await controller.removeProfile(mockRequest as any);

      expect(mockUserService.remove).toHaveBeenCalledWith('user-123');
    });
  });

  describe('create (admin)', () => {
    it('should create new user', async () => {
      const createDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: UserRole.AGENT,
      };

      const mockUser = {
        id: 'new-user-id',
        ...createDto,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.create.mockResolvedValue(mockUser);
      mockUserService.toResponseDto.mockReturnValue(mockUser);

      const result = await controller.create(createDto);

      expect(mockUserService.create).toHaveBeenCalledWith(createDto);
      expect(result).toBeDefined();
    });
  });

  describe('findAll (admin)', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          role: UserRole.AGENT,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResponse = {
        users: mockUsers,
        total: 1,
      };

      mockUserService.findAll.mockResolvedValue(mockUsers);
      mockUserService.toListResponse.mockReturnValue(mockResponse);

      const result = await controller.findAll();

      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne (admin)', () => {
    it('should return user by id', async () => {
      const userId = 'test-id';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockUserService.toResponseDto.mockReturnValue(mockUser);

      const result = await controller.findOne(userId);

      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toBeDefined();
    });
  });

  describe('update (admin)', () => {
    it('should update user', async () => {
      const userId = 'test-id';
      const updateDto = {
        name: 'Updated Name',
      };

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: updateDto.name,
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.update.mockResolvedValue(mockUser);
      mockUserService.toResponseDto.mockReturnValue(mockUser);

      const result = await controller.update(userId, updateDto);

      expect(mockUserService.update).toHaveBeenCalledWith(userId, updateDto);
      expect(result).toBeDefined();
    });
  });

  describe('remove (admin)', () => {
    it('should remove user', async () => {
      const userId = 'test-id';

      mockUserService.remove.mockResolvedValue(undefined);

      await controller.remove(userId);

      expect(mockUserService.remove).toHaveBeenCalledWith(userId);
    });
  });
});

