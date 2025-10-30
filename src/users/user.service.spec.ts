import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserRole } from './user.model';
import { Property } from '../properties/property.model';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let propertyRepository: Repository<Property>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockPropertyRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Property),
          useValue: mockPropertyRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    propertyRepository = module.get<Repository<Property>>(getRepositoryToken(Property));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash password before saving', async () => {
      const createDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'plainPassword',
        role: UserRole.AGENT,
      };

      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const mockUser = {
        id: '1',
        ...createDto,
        password: hashedPassword,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service.create(createDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should create user with provided data', async () => {
      const createDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.AGENT,
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const mockUser = {
        id: '1',
        ...createDto,
        password: 'hashedPassword',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(result.name).toBe(createDto.name);
      expect(result.email).toBe(createDto.email);
    });

    it('should return safe user without password', async () => {
      const createDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.AGENT,
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const mockUser = {
        id: '1',
        ...createDto,
        password: 'hashedPassword',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findAll', () => {
    it('should return only non-deleted users', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'User 1',
          email: 'user1@example.com',
          password: 'hash1',
          role: UserRole.AGENT,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'User 2',
          email: 'user2@example.com',
          password: 'hash2',
          role: UserRole.AGENT,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(mockUserRepository.find).toHaveBeenCalledWith({ where: { isDeleted: false } });
      expect(result).toHaveLength(2);
    });

    it('should exclude password from results', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'User 1',
          email: 'user1@example.com',
          password: 'hash1',
          role: UserRole.AGENT,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', isDeleted: false },
      });
      expect(result?.id).toBe('1');
    });

    it('should return null for deleted users', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('1');

      expect(result).toBeNull();
    });

    it('should exclude password', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      const updateDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const updatedUser = {
        id: '1',
        ...updateDto,
        password: 'hashedPassword',
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateDto);

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: '1', isDeleted: false },
        updateDto,
      );
      expect(result?.name).toBe(updateDto.name);
    });

    it('should hash password if provided', async () => {
      const updateDto = {
        password: 'newPassword',
      };

      const hashedPassword = 'newHashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.update('1', updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(updateDto.password, 10);
    });

    it('should not update deleted users', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      await service.update('1', { name: 'New Name' });

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: '1', isDeleted: false },
        expect.any(Object),
      );
    });
  });

  describe('updateProfile', () => {
    it('should update profile fields', async () => {
      const updateDto = {
        name: 'New Name',
      };

      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue({
        id: '1',
        name: updateDto.name,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.updateProfile('1', updateDto);

      expect(result?.name).toBe(updateDto.name);
    });

    it('should hash new password', async () => {
      const updateDto = {
        password: 'newPassword123',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'newHashedPassword',
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.updateProfile('1', updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
    });
  });

  describe('remove', () => {
    it('should soft delete user', async () => {
      mockPropertyRepository.count.mockResolvedValue(0);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: '1', isDeleted: false },
        expect.objectContaining({
          isDeleted: true,
          deletedAt: expect.any(Date),
        }),
      );
    });

    it('should throw error if user has active properties', async () => {
      mockPropertyRepository.count.mockResolvedValue(3);

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
      await expect(service.remove('1')).rejects.toThrow('Cannot delete user with active properties assigned');
    });

    it('should set deletedAt timestamp', async () => {
      mockPropertyRepository.count.mockResolvedValue(0);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: '1', isDeleted: false },
        expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result?.email).toBe('test@example.com');
    });

    it('should include deleted users when flag is true', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.AGENT,
        isDeleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await service.findByEmail('test@example.com', { includeDeleted: true });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'test@example.com' },
        }),
      );
    });

    it('should return password in select', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toHaveProperty('password');
    });
  });

  describe('restore', () => {
    it('should restore soft deleted user', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      await service.restore('1');

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: '1' },
        { isDeleted: false, deletedAt: null },
      );
    });

    it('should clear deletedAt', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      await service.restore('1');

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: '1' },
        expect.objectContaining({ deletedAt: null }),
      );
    });
  });

  describe('toResponseDto', () => {
    it('should transform user to response DTO', () => {
      const safeUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.toResponseDto(safeUser);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('toListResponse', () => {
    it('should transform users array to list response', () => {
      const users = [
        {
          id: '1',
          name: 'User 1',
          email: 'user1@example.com',
          role: UserRole.AGENT,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'User 2',
          email: 'user2@example.com',
          role: UserRole.AGENT,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = service.toListResponse(users);

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });
});

