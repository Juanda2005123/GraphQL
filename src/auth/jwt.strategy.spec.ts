import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UserRole } from '../users/user.model';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate and return user data from JWT payload', () => {
      const payload = {
        sub: 'user-id-123',
        username: 'test@example.com',
        role: UserRole.AGENT,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user-id-123',
        email: 'test@example.com',
        role: UserRole.AGENT,
      });
    });

    it('should map sub to userId', () => {
      const payload = {
        sub: 'test-id',
        username: 'user@example.com',
        role: UserRole.SUPERADMIN,
      };

      const result = strategy.validate(payload);

      expect(result.userId).toBe('test-id');
      expect(result).not.toHaveProperty('sub');
    });

    it('should map username to email', () => {
      const payload = {
        sub: 'id',
        username: 'test@mail.com',
        role: UserRole.AGENT,
      };

      const result = strategy.validate(payload);

      expect(result.email).toBe('test@mail.com');
      expect(result).not.toHaveProperty('username');
    });

    it('should preserve role', () => {
      const payload = {
        sub: 'id',
        username: 'email@test.com',
        role: UserRole.SUPERADMIN,
      };

      const result = strategy.validate(payload);

      expect(result.role).toBe(UserRole.SUPERADMIN);
    });
  });
});

