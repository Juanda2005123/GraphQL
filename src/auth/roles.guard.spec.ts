import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../users/user.model';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when no roles required', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: '1', role: UserRole.AGENT },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: '1', role: UserRole.SUPERADMIN },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.SUPERADMIN]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should deny access when user lacks required role', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: '1', role: UserRole.AGENT },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.SUPERADMIN]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should throw UnauthorizedException when no user', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.AGENT]);

      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });

    it('should allow agent role when specified', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: '1', role: UserRole.AGENT },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.AGENT]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should allow when user has one of multiple required roles', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: '1', role: UserRole.AGENT },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.SUPERADMIN, UserRole.AGENT]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });
});

