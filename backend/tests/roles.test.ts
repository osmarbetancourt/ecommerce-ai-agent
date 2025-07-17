import request from 'supertest';
import { createApp } from '../src/index';

const app = createApp();

describe('Roles API integration', () => {
  let createdRoleId: number | undefined;
  const isTestEnv = process.env.NODE_ENV === 'test';

  it('GET /api/roles should return an array', async () => {
    const res = await request(app).get('/api/roles');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/roles/:id with non-existent id should return 404', async () => {
    const res = await request(app).get('/api/roles/999999');
    expect(res.statusCode).toBe(404);
  });

  (isTestEnv ? it : it.skip)('POST /api/roles should add a role', async () => {
    const role = { name: 'TestRole', description: 'Role for testing' };
    const res = await request(app).post('/api/roles').send(role);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', role.name);
    createdRoleId = res.body.id;
  });

  (isTestEnv ? it : it.skip)('GET /api/roles/:id should return the created role', async () => {
    if (!createdRoleId) return;
    const res = await request(app).get(`/api/roles/${createdRoleId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdRoleId);
    expect(res.body).toHaveProperty('name');
  });

  (isTestEnv ? it : it.skip)('PUT /api/roles/:id should update the role', async () => {
    if (!createdRoleId) return;
    const update = { description: 'Updated description' };
    const res = await request(app).put(`/api/roles/${createdRoleId}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdRoleId);
    expect(res.body).toHaveProperty('description', update.description);
  });

  (isTestEnv ? it : it.skip)('DELETE /api/roles/:id should delete the role', async () => {
    if (!createdRoleId) return;
    const res = await request(app).delete(`/api/roles/${createdRoleId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Confirm deletion
    const check = await request(app).get(`/api/roles/${createdRoleId}`);
    expect(check.statusCode).toBe(404);
  });
});
