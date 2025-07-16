import request from 'supertest';
import { createApp } from '../src/index';

const app = createApp();

describe('Categories API integration', () => {
  let createdId: number | undefined;
  const isTestEnv = process.env.NODE_ENV === 'test';

  it('GET /api/categories should return an array', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/categories/:id with non-existent id should return 404', async () => {
    const res = await request(app).get('/api/categories/999999');
    expect(res.statusCode).toBe(404);
  });

  (isTestEnv ? it : it.skip)('POST /api/categories should create a category', async () => {
    const category = { name: 'Test Category' };
    const res = await request(app).post('/api/categories').send(category);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(category.name);
    createdId = res.body.id;
  });

  (isTestEnv ? it : it.skip)('GET /api/categories/:id should return the created category', async () => {
    if (!createdId) return;
    const res = await request(app).get(`/api/categories/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
  });

  (isTestEnv ? it : it.skip)('PUT /api/categories/:id should update the category', async () => {
    if (!createdId) return;
    const update = { name: 'Updated Category' };
    const res = await request(app).put(`/api/categories/${createdId}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(update.name);
  });

  (isTestEnv ? it : it.skip)('DELETE /api/categories/:id should delete the category', async () => {
    if (!createdId) return;
    const res = await request(app).delete(`/api/categories/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Confirm deletion
    const check = await request(app).get(`/api/categories/${createdId}`);
    expect(check.statusCode).toBe(404);
  });
});
