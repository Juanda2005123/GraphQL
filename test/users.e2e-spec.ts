import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, mockUsers} from './test-utils';

describe('Users E2E', () => {
  let app: INestApplication;
  let agentToken: string;
  let superadminToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    // Get agent token
    const agentLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: mockUsers.agent.email,
        password: mockUsers.agent.password,
      });
    agentToken = agentLogin.body.token;

    // Get superadmin token
    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: mockUsers.superadmin.email,
        password: mockUsers.superadmin.password,
      });
    superadminToken = adminLogin.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users/me', () => {
    it('should return current user profile', () => {
      return request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('role');
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/users/me')
        .expect(401);
    });

    it('should not return password', () => {
      return request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).not.toHaveProperty('password');
        });
    });
  });

  describe('PUT /api/users/me', () => {
    it('should update user profile', async () => {
      const newName = `Updated Name ${Date.now()}`;

      return request(app.getHttpServer())
        .put('/api/users/me')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          name: newName,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(newName);
        });
    });

    it('should hash new password', async () => {
      // Update password
      await request(app.getHttpServer())
        .put('/api/users/me')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          password: 'newpassword123',
        })
        .expect(200);

      // Try to login with new password
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: mockUsers.agent.email,
          password: 'newpassword123',
        })
        .expect(200);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .put('/api/users/me')
        .send({
          name: 'New Name',
        })
        .expect(401);
    });
  });

  describe('DELETE /api/users/me', () => {
    it('should soft delete user account', async () => {
      // Create a new user for deletion
      const email = `deletetest${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Delete Test',
          email,
          password: 'password123',
        });

      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email,
          password: 'password123',
        });

      const token = loginRes.body.token;

      return request(app.getHttpServer())
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .delete('/api/users/me')
        .expect(401);
    });
  });

  describe('POST /api/users (admin)', () => {
    it('should create user as superadmin', () => {
      const email = `adminuser${Date.now()}@example.com`;

      return request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Admin Created User',
          email,
          password: 'password123',
          role: 'agent',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(email);
        });
    });

    it('should deny access to agents', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          name: 'Test User',
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          role: 'agent',
        })
        .expect(403);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'agent',
        })
        .expect(401);
    });
  });

  describe('GET /api/users (admin)', () => {
    it('should list all users as superadmin', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('users');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.users)).toBe(true);
        });
    });

    it('should deny access to agents', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .expect(401);
    });
  });

  describe('GET /api/users/:id (admin)', () => {
    it('should get user by id as superadmin', async () => {
      // Get list of users first
      const listRes = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${superadminToken}`);

      const userId = listRes.body.users[0].id;

      return request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
        });
    });

    it('should deny access to agents', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${superadminToken}`);

      const userId = listRes.body.users[0].id;

      return request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });
  });

  describe('PUT /api/users/:id (admin)', () => {
    it('should update user as superadmin', async () => {
      // Create a user to update
      const createRes = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Update Test',
          email: `updatetest${Date.now()}@example.com`,
          password: 'password123',
          role: 'agent',
        });

      const userId = createRes.body.id;
      const newName = 'Updated Name';

      return request(app.getHttpServer())
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: newName,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(newName);
        });
    });

    it('should deny access to agents', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${superadminToken}`);

      const userId = listRes.body.users[0].id;

      return request(app.getHttpServer())
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          name: 'New Name',
        })
        .expect(403);
    });
  });

  describe('DELETE /api/users/:id (admin)', () => {
    it('should delete user as superadmin', async () => {
      // Create a user to delete
      const createRes = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Delete Test',
          email: `deletetest${Date.now()}@example.com`,
          password: 'password123',
          role: 'agent',
        });

      const userId = createRes.body.id;

      return request(app.getHttpServer())
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(204);
    });

    it('should deny access to agents', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${superadminToken}`);

      const userId = listRes.body.users[0].id;

      return request(app.getHttpServer())
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });
  });
});

