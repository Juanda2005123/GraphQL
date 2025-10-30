import { User, UserRole } from './user.model';

describe('User Model', () => {
  it('should create a user instance', () => {
    const user = new User();
    expect(user).toBeDefined();
  });

  it('should have UserRole enum with correct values', () => {
    expect(UserRole.SUPERADMIN).toBe('superadmin');
    expect(UserRole.AGENT).toBe('agent');
  });

  it('should accept valid user properties', () => {
    const user = new User();
    user.id = 'test-id';
    user.name = 'Test User';
    user.email = 'test@example.com';
    user.password = 'hashedPassword';
    user.role = UserRole.AGENT;
    user.isDeleted = false;
    user.twoFactorEnabled = false;
    user.twoFactorSecret = 'secret';

    expect(user.id).toBe('test-id');
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe(UserRole.AGENT);
    expect(user.isDeleted).toBe(false);
    expect(user.twoFactorEnabled).toBe(false);
  });

  it('should accept SUPERADMIN role', () => {
    const user = new User();
    user.role = UserRole.SUPERADMIN;
    expect(user.role).toBe(UserRole.SUPERADMIN);
  });

  it('should accept AGENT role', () => {
    const user = new User();
    user.role = UserRole.AGENT;
    expect(user.role).toBe(UserRole.AGENT);
  });

  it('should have default values', () => {
    const user = new User();
    expect(user.isDeleted).toBeFalsy();
    expect(user.twoFactorEnabled).toBeFalsy();
  });
});

