import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, mockUsers } from './test-utils';

describe('Properties E2E', () => {
  let app: INestApplication;
  let agentToken: string;
  let agentLisaToken: string;
  let superadminToken: string;
  let agentPropertyId: string;

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

    // Get agent Lisa token
    const agentLisaLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: mockUsers.agentLisa.email,
        password: mockUsers.agentLisa.password,
      });
    agentLisaToken = agentLisaLogin.body.token;

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

  describe('GET /api/properties (public)', () => {
    it('should list properties without auth', () => {
      return request(app.getHttpServer())
        .get('/api/properties')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('properties');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.properties)).toBe(true);
        });
    });

    it('should not show deleted properties', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties')
        .expect(200);

      // All properties should have isDeleted = false or not have the field
      res.body.properties.forEach((property: any) => {
        expect(property.isDeleted).toBeFalsy();
      });
    });

    it('should include owner information', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/properties')
        .expect(200);

      if (res.body.properties.length > 0) {
        expect(res.body.properties[0]).toHaveProperty('ownerId');
      }
    });
  });

  describe('GET /api/properties/:id (public)', () => {
    it('should get property by id without auth', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/properties');

      if (listRes.body.properties.length > 0) {
        const propertyId = listRes.body.properties[0].id;

        return request(app.getHttpServer())
          .get(`/api/properties/${propertyId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.id).toBe(propertyId);
          });
      }
    });

    it('should return 404 for non-existent property', () => {
      return request(app.getHttpServer())
        .get('/api/properties/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('POST /api/properties/agent', () => {
    it('should create property as agent', async () => {
      const propertyData = {
        title: `Test Property ${Date.now()}`,
        description: 'A beautiful test property',
        price: 150000,
        location: 'Test City',
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        imageUrls: ['https://example.com/image.jpg'],
      };

      const res = await request(app.getHttpServer())
        .post('/api/properties/agent')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(propertyData)
        .expect(201);

      agentPropertyId = res.body.id;

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(propertyData.title);
      expect(res.body).toHaveProperty('ownerId');
    });

    it('should auto-assign agent as owner', async () => {
      const propertyData = {
        title: `Agent Property ${Date.now()}`,
        description: 'Property owned by agent',
        price: 200000,
        location: 'Agent City',
        bedrooms: 4,
        bathrooms: 3,
        area: 150,
        imageUrls: [],
      };

      const res = await request(app.getHttpServer())
        .post('/api/properties/agent')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(propertyData)
        .expect(201);

      expect(res.body.ownerId).toBeDefined();
    });

    it('should deny access to non-authenticated', () => {
      return request(app.getHttpServer())
        .post('/api/properties/agent')
        .send({
          title: 'Test Property',
          description: 'Description',
          price: 100000,
          location: 'Location',
          bedrooms: 3,
          bathrooms: 2,
          area: 100,
          imageUrls: [],
        })
        .expect(401);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/properties/agent')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: 'Missing fields',
        })
        .expect(400);
    });
  });

  describe('PUT /api/properties/agent/:id', () => {
    it('should update own property', async () => {
      const updateData = {
        title: `Updated Property ${Date.now()}`,
        price: 175000,
      };

      return request(app.getHttpServer())
        .put(`/api/properties/agent/${agentPropertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe(updateData.title);
          expect(Number(res.body.price)).toBe(updateData.price);
        });
    });

    it('should deny updating others\' properties', async () => {
      // Get Lisa's property
      const lisaPropertyRes = await request(app.getHttpServer())
        .post('/api/properties/agent')
        .set('Authorization', `Bearer ${agentLisaToken}`)
        .send({
          title: `Lisa Property ${Date.now()}`,
          description: 'Lisa\'s property',
          price: 300000,
          location: 'Lisa City',
          bedrooms: 5,
          bathrooms: 4,
          area: 200,
          imageUrls: [],
        });

      const lisaPropertyId = lisaPropertyRes.body.id;

      // Try to update with different agent token
      return request(app.getHttpServer())
        .put(`/api/properties/agent/${lisaPropertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: 'Trying to update',
        })
        .expect(403);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .put(`/api/properties/agent/${agentPropertyId}`)
        .send({
          title: 'Updated',
        })
        .expect(401);
    });
  });

  describe('DELETE /api/properties/agent/:id', () => {
    it('should soft delete own property', async () => {
      // Create property to delete
      const createRes = await request(app.getHttpServer())
        .post('/api/properties/agent')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: `Delete Property ${Date.now()}`,
          description: 'To be deleted',
          price: 100000,
          location: 'Test',
          bedrooms: 2,
          bathrooms: 1,
          area: 80,
          imageUrls: [],
        });

      const propertyId = createRes.body.id;

      return request(app.getHttpServer())
        .delete(`/api/properties/agent/${propertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(204);
    });

    it('should deny deleting others\' properties', async () => {
      // Get Lisa's property
      const lisaPropertyRes = await request(app.getHttpServer())
        .post('/api/properties/agent')
        .set('Authorization', `Bearer ${agentLisaToken}`)
        .send({
          title: `Lisa Delete Property ${Date.now()}`,
          description: 'Description',
          price: 200000,
          location: 'Location',
          bedrooms: 3,
          bathrooms: 2,
          area: 120,
          imageUrls: [],
        });

      const lisaPropertyId = lisaPropertyRes.body.id;

      return request(app.getHttpServer())
        .delete(`/api/properties/agent/${lisaPropertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });
  });

  describe('POST /api/properties/admin', () => {
    it('should create property with specified owner', async () => {
      // Get an agent's ID
      const usersRes = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${superadminToken}`);

      const agentUser = usersRes.body.users.find((u: any) => u.role === 'agent');

      return request(app.getHttpServer())
        .post('/api/properties/admin')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          title: `Admin Property ${Date.now()}`,
          description: 'Created by admin',
          price: 250000,
          location: 'Admin Location',
          bedrooms: 4,
          bathrooms: 3,
          area: 180,
          imageUrls: [],
          ownerId: agentUser.id,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.ownerId).toBe(agentUser.id);
        });
    });

    it('should deny access to agents', () => {
      return request(app.getHttpServer())
        .post('/api/properties/admin')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: 'Test',
          description: 'Test',
          price: 100000,
          location: 'Test',
          bedrooms: 2,
          bathrooms: 1,
          area: 80,
          imageUrls: [],
          ownerId: 'some-id',
        })
        .expect(403);
    });
  });

  describe('PUT /api/properties/admin/:id', () => {
    it('should update any property as admin', async () => {
      const updateData = {
        title: `Admin Updated ${Date.now()}`,
      };

      return request(app.getHttpServer())
        .put(`/api/properties/admin/${agentPropertyId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe(updateData.title);
        });
    });

    it('should deny access to agents', () => {
      return request(app.getHttpServer())
        .put(`/api/properties/admin/${agentPropertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: 'Updated',
        })
        .expect(403);
    });
  });

  describe('DELETE /api/properties/admin/:id', () => {
    it('should delete any property as admin', async () => {
      // Create property to delete
      const usersRes = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${superadminToken}`);

      const agentUser = usersRes.body.users.find((u: any) => u.role === 'agent');

      const createRes = await request(app.getHttpServer())
        .post('/api/properties/admin')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          title: `Admin Delete ${Date.now()}`,
          description: 'To be deleted by admin',
          price: 150000,
          location: 'Test',
          bedrooms: 3,
          bathrooms: 2,
          area: 100,
          imageUrls: [],
          ownerId: agentUser.id,
        });

      const propertyId = createRes.body.id;

      return request(app.getHttpServer())
        .delete(`/api/properties/admin/${propertyId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(204);
    });

    it('should deny access to agents', () => {
      return request(app.getHttpServer())
        .delete(`/api/properties/admin/${agentPropertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });
  });
});

