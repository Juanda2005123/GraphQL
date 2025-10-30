import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '../users/user.model';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.validateUser and login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        email: loginDto.email,
        name: 'Test User',
        role: UserRole.AGENT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockResponse = {
        token: 'jwt-token',
        user: {
          id: '1',
          email: loginDto.email,
          name: 'Test User',
          role: UserRole.AGENT,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockReturnValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockResponse);
    });

    it('should throw UnauthorizedException when user is invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const registerDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      const mockResponse = {
        id: '1',
        name: registerDto.name,
        email: registerDto.email,
        role: UserRole.AGENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should call authService.logout', () => {
      const mockLogoutResponse = {
        message: 'Session terminated. Please discard the JWT on the client.',
      };

      mockAuthService.logout.mockReturnValue(mockLogoutResponse);

      const result = controller.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(result).toEqual(mockLogoutResponse);
    });
  });
});

