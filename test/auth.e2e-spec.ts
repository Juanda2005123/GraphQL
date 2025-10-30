import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, mockUsers } from './test-utils';

describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register new user as agent', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'New Test User',
          email: `newuser${Date.now()}@example.com`,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('role', 'agent');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 401 for existing email', async () => {
      const email = `existing${Date.now()}@example.com`;
      
      // First registration
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'First User',
          email,
          password: 'password123',
        })
        .expect(201);

      // Try to register again with same email
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email,
          password: 'password456',
        })
        .expect(401);
    });

    it('should return 400 for missing fields', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: mockUsers.agent.email,
          password: mockUsers.agent.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('email', mockUsers.agent.email);
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should return JWT token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: mockUsers.superadmin.email,
          password: mockUsers.superadmin.password,
        })
        .expect(200)
        .expect((res) => {
          expect(typeof res.body.token).toBe('string');
          expect(res.body.token.length).toBeGreaterThan(20);
        });
    });

    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: mockUsers.agent.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should return 400 for missing email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for missing password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return logout message', async () => {
      // Login first to get token
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: mockUsers.agent.email,
          password: mockUsers.agent.password,
        })
        .expect(200);

      const token = loginRes.body.token;
      expect(token).toBeDefined();

      return request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Session terminated');
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(401);
    });
  });
});

