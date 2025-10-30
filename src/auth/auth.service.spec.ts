import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
import { UserRole } from '../users/user.model';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    restore: jest.fn(),
    toResponseDto: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@example.com');
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('notfound@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: UserRole.AGENT,
        isDeleted: false,
      };

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate JWT token with correct payload', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'jwt.token.here';
      const mockResponseDto = { id: '1', email: 'test@example.com', name: 'Test User', role: UserRole.AGENT };

      mockJwtService.sign.mockReturnValue(mockToken);
      mockUserService.toResponseDto.mockReturnValue(mockResponseDto);

      const result = service.login(mockUser);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
      expect(result.token).toBe(mockToken);
      expect(result.user).toBeDefined();
    });

    it('should return user data in response', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockJwtService.sign.mockReturnValue('token');
      mockUserService.toResponseDto.mockReturnValue({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });

      const result = service.login(mockUser);

      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.role).toBe(mockUser.role);
    });
  });

  describe('register', () => {
    it('should create new user with agent role', async () => {
      const registerDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      const mockCreatedUser = {
        id: '1',
        ...registerDto,
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(mockCreatedUser);
      mockUserService.toResponseDto.mockReturnValue({
        id: mockCreatedUser.id,
        name: mockCreatedUser.name,
        email: mockCreatedUser.email,
        role: mockCreatedUser.role,
        createdAt: mockCreatedUser.createdAt,
        updatedAt: mockCreatedUser.updatedAt,
      });

      const result = await service.register(registerDto);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(registerDto.email, { includeDeleted: true });
      expect(mockUserService.create).toHaveBeenCalledWith({
        ...registerDto,
        role: UserRole.AGENT,
      });
      expect(result.email).toBe(registerDto.email);
    });

    it('should throw error when email already exists', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      const existingUser = {
        id: '1',
        email: registerDto.email,
        isDeleted: false,
      };

      mockUserService.findByEmail.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.register(registerDto)).rejects.toThrow('User already exists');
    });

    it('should restore and update deleted user', async () => {
      const registerDto = {
        name: 'Restored User',
        email: 'deleted@example.com',
        password: 'password123',
      };

      const deletedUser = {
        id: '1',
        email: registerDto.email,
        isDeleted: true,
      };

      const restoredUser = {
        id: '1',
        ...registerDto,
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.findByEmail.mockResolvedValue(deletedUser);
      mockUserService.update.mockResolvedValue(restoredUser);
      mockUserService.toResponseDto.mockReturnValue({
        id: restoredUser.id,
        name: restoredUser.name,
        email: restoredUser.email,
        role: restoredUser.role,
        createdAt: restoredUser.createdAt,
        updatedAt: restoredUser.updatedAt,
      });

      const result = await service.register(registerDto);

      expect(mockUserService.restore).toHaveBeenCalledWith(deletedUser.id);
      expect(mockUserService.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error if unable to restore deleted user', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const deletedUser = {
        id: '1',
        email: registerDto.email,
        isDeleted: true,
      };

      mockUserService.findByEmail.mockResolvedValue(deletedUser);
      mockUserService.update.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should return logout message', () => {
      const result = service.logout();

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Session terminated');
    });
  });
});

