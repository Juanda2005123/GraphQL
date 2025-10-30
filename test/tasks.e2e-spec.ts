import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, mockUsers } from './test-utils';

describe('Tasks E2E', () => {
  let app: INestApplication;
  let agentToken: string;
  let agentLisaToken: string;
  let superadminToken: string;
  let agentPropertyId: string;
  let lisaPropertyId: string;
  let agentTaskId: string;

  beforeAll(async () => {
    app = await createTestApp();

    // Get tokens
    const agentLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: mockUsers.agent.email,
        password: mockUsers.agent.password,
      });
    agentToken = agentLogin.body.token;

    const agentLisaLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: mockUsers.agentLisa.email,
        password: mockUsers.agentLisa.password,
      });
    agentLisaToken = agentLisaLogin.body.token;

    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: mockUsers.superadmin.email,
        password: mockUsers.superadmin.password,
      });
    superadminToken = adminLogin.body.token;

    // Create test properties
    const agentPropertyRes = await request(app.getHttpServer())
      .post('/api/properties/agent')
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        title: `Agent Test Property ${Date.now()}`,
        description: 'For task testing',
        price: 100000,
        location: 'Test City',
        bedrooms: 3,
        bathrooms: 2,
        area: 100,
        imageUrls: [],
      });
    agentPropertyId = agentPropertyRes.body.id;

    const lisaPropertyRes = await request(app.getHttpServer())
      .post('/api/properties/agent')
      .set('Authorization', `Bearer ${agentLisaToken}`)
      .send({
        title: `Lisa Test Property ${Date.now()}`,
        description: 'For task testing',
        price: 200000,
        location: 'Lisa City',
        bedrooms: 4,
        bathrooms: 3,
        area: 150,
        imageUrls: [],
      });
    lisaPropertyId = lisaPropertyRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/tasks/agent', () => {
    it('should list agent\'s tasks', () => {
      return request(app.getHttpServer())
        .get('/api/tasks/agent')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('tasks');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.tasks)).toBe(true);
        });
    });

    it('should only show tasks for owned properties', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/tasks/agent')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      // All tasks should be for properties owned by the agent
      res.body.tasks.forEach((task: any) => {
        expect(task.assignedToId).toBeDefined();
      });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/tasks/agent')
        .expect(401);
    });
  });

  describe('POST /api/tasks/agent', () => {
    it('should create task for own property', async () => {
      const taskData = {
        title: `Test Task ${Date.now()}`,
        description: 'Task description',
        propertyId: agentPropertyId,
      };

      const res = await request(app.getHttpServer())
        .post('/api/tasks/agent')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(taskData)
        .expect(201);

      agentTaskId = res.body.id;

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(taskData.title);
      expect(res.body.propertyId).toBe(agentPropertyId);
    });

    it('should auto-assign to agent', async () => {
      const taskData = {
        title: `Auto Assign Task ${Date.now()}`,
        description: 'Should be assigned to agent',
        propertyId: agentPropertyId,
      };

      const res = await request(app.getHttpServer())
        .post('/api/tasks/agent')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(taskData)
        .expect(201);

      expect(res.body.assignedToId).toBeDefined();
    });

    it('should deny creating task for others\' property', () => {
      const taskData = {
        title: 'Unauthorized Task',
        description: 'Should fail',
        propertyId: lisaPropertyId,
      };

      return request(app.getHttpServer())
        .post('/api/tasks/agent')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(taskData)
        .expect(403);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/api/tasks/agent')
        .send({
          title: 'Task',
          description: 'Description',
          propertyId: agentPropertyId,
        })
        .expect(401);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/tasks/agent')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: 'Missing propertyId',
        })
        .expect(400);
    });
  });

  describe('GET /api/tasks/agent/:id', () => {
    it('should get own task', () => {
      return request(app.getHttpServer())
        .get(`/api/tasks/agent/${agentTaskId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(agentTaskId);
        });
    });

    it('should deny access to others\' tasks', async () => {
      // Create task for Lisa
      const lisaTaskRes = await request(app.getHttpServer())
        .post('/api/tasks/agent')
        .set('Authorization', `Bearer ${agentLisaToken}`)
        .send({
          title: `Lisa Task ${Date.now()}`,
          description: 'Lisa\'s task',
          propertyId: lisaPropertyId,
        });

      const lisaTaskId = lisaTaskRes.body.id;

      return request(app.getHttpServer())
        .get(`/api/tasks/agent/${lisaTaskId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get(`/api/tasks/agent/${agentTaskId}`)
        .expect(401);
    });
  });

  describe('GET /api/tasks/agent/property/:propertyId', () => {
    it('should list tasks for own property', () => {
      return request(app.getHttpServer())
        .get(`/api/tasks/agent/property/${agentPropertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('tasks');
          expect(Array.isArray(res.body.tasks)).toBe(true);
        });
    });

    it('should deny access to others\' properties', () => {
      return request(app.getHttpServer())
        .get(`/api/tasks/agent/property/${lisaPropertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });
  });

  describe('PUT /api/tasks/agent/:id', () => {
    it('should update own task', () => {
      const updateData = {
        title: `Updated Task ${Date.now()}`,
        isCompleted: true,
      };

      return request(app.getHttpServer())
        .put(`/api/tasks/agent/${agentTaskId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe(updateData.title);
          expect(res.body.isCompleted).toBe(true);
        });
    });

    it('should deny updating others\' tasks', async () => {
      const lisaTaskRes = await request(app.getHttpServer())
        .post('/api/tasks/agent')
        .set('Authorization', `Bearer ${agentLisaToken}`)
        .send({
          title: `Lisa Update Task ${Date.now()}`,
          description: 'Description',
          propertyId: lisaPropertyId,
        });

      const lisaTaskId = lisaTaskRes.body.id;

      return request(app.getHttpServer())
        .put(`/api/tasks/agent/${lisaTaskId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: 'Trying to update',
        })
        .expect(403);
    });
  });

  describe('DELETE /api/tasks/agent/:id', () => {
    it('should soft delete own task', async () => {
      // Create task to delete
      const createRes = await request(app.getHttpServer())
        .post('/api/tasks/agent')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: `Delete Task ${Date.now()}`,
          description: 'To be deleted',
          propertyId: agentPropertyId,
        });

      const taskId = createRes.body.id;

      return request(app.getHttpServer())
        .delete(`/api/tasks/agent/${taskId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(204);
    });

    it('should deny deleting others\' tasks', async () => {
      const lisaTaskRes = await request(app.getHttpServer())
        .post('/api/tasks/agent')
        .set('Authorization', `Bearer ${agentLisaToken}`)
        .send({
          title: `Lisa Delete Task ${Date.now()}`,
          description: 'Description',
          propertyId: lisaPropertyId,
        });

      const lisaTaskId = lisaTaskRes.body.id;

      return request(app.getHttpServer())
        .delete(`/api/tasks/agent/${lisaTaskId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });
  });

  describe('GET /api/tasks/admin', () => {
    it('should list all tasks as admin', () => {
      return request(app.getHttpServer())
        .get('/api/tasks/admin')
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('tasks');
          expect(Array.isArray(res.body.tasks)).toBe(true);
        });
    });

    it('should deny access to agents', () => {
      return request(app.getHttpServer())
        .get('/api/tasks/admin')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });
  });

  describe('POST /api/tasks/admin', () => {
    it('should create task for any property', async () => {
      // Get an agent's ID
      const usersRes = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${superadminToken}`);

      const agentUser = usersRes.body.users.find((u: any) => u.role === 'agent');

      const taskData = {
        title: `Admin Task ${Date.now()}`,
        description: 'Created by admin',
        propertyId: agentPropertyId,
        assignedToId: agentUser.id,
      };

      return request(app.getHttpServer())
        .post('/api/tasks/admin')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(taskData)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe(taskData.title);
          expect(res.body.propertyId).toBe(agentPropertyId);
        });
    });

    it('should deny access to agents', () => {
      return request(app.getHttpServer())
        .post('/api/tasks/admin')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: 'Task',
          description: 'Description',
          propertyId: agentPropertyId,
          assignedToId: 'some-id',
        })
        .expect(403);
    });
  });

  describe('GET /api/tasks/admin/:id', () => {
    it('should get any task as admin', () => {
      return request(app.getHttpServer())
        .get(`/api/tasks/admin/${agentTaskId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(agentTaskId);
        });
    });

    it('should deny access to agents', () => {
      return request(app.getHttpServer())
        .get(`/api/tasks/admin/${agentTaskId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });
  });

  describe('GET /api/tasks/admin/property/:propertyId', () => {
    it('should list tasks for any property', () => {
      return request(app.getHttpServer())
        .get(`/api/tasks/admin/property/${agentPropertyId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('tasks');
        });
    });

    it('should deny access to agents', () => {
      return request(app.getHttpServer())
        .get(`/api/tasks/admin/property/${agentPropertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });
  });

  describe('PUT /api/tasks/admin/:id', () => {
    it('should update any task as admin', () => {
      const updateData = {
        title: `Admin Updated ${Date.now()}`,
      };

      return request(app.getHttpServer())
        .put(`/api/tasks/admin/${agentTaskId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe(updateData.title);
        });
    });

    it('should deny access to agents', () => {
      return request(app.getHttpServer())
        .put(`/api/tasks/admin/${agentTaskId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: 'Updated',
        })
        .expect(403);
    });
  });

  describe('DELETE /api/tasks/admin/:id', () => {
    it('should delete any task as admin', async () => {
      // Create task to delete
      const usersRes = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${superadminToken}`);

      const agentUser = usersRes.body.users.find((u: any) => u.role === 'agent');

      const createRes = await request(app.getHttpServer())
        .post('/api/tasks/admin')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          title: `Admin Delete Task ${Date.now()}`,
          description: 'To be deleted',
          propertyId: agentPropertyId,
          assignedToId: agentUser.id,
        });

      const taskId = createRes.body.id;

      return request(app.getHttpServer())
        .delete(`/api/tasks/admin/${taskId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(204);
    });

    it('should deny access to agents', () => {
      return request(app.getHttpServer())
        .delete(`/api/tasks/admin/${agentTaskId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });
  });
});

