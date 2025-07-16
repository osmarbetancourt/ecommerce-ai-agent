import request from 'supertest';
import { createApp } from '../src/index';

const app = createApp();

describe('Carts API integration', () => {
  let createdId: number | undefined;
  const isTestEnv = process.env.NODE_ENV === 'test';

  it('GET /api/carts should return an array', async () => {
    const res = await request(app).get('/api/carts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/carts/:id with non-existent id should return 404', async () => {
    const res = await request(app).get('/api/carts/999999');
    expect(res.statusCode).toBe(404);
  });

  (isTestEnv ? it : it.skip)('POST /api/carts should create a cart', async () => {
    const cart = {};
    const res = await request(app).post('/api/carts').send(cart);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  (isTestEnv ? it : it.skip)('GET /api/carts/:id should return the created cart', async () => {
    if (!createdId) return;
    const res = await request(app).get(`/api/carts/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  (isTestEnv ? it : it.skip)('PUT /api/carts/:id should update the cart', async () => {
    if (!createdId) return;
    // Update created_at to a new timestamp
    const update = { created_at: new Date().toISOString() };
    const res = await request(app).put(`/api/carts/${createdId}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
    expect(new Date(res.body.created_at).toISOString()).toBe(update.created_at);
  });

  (isTestEnv ? it : it.skip)('DELETE /api/carts/:id should delete the cart', async () => {
    if (!createdId) return;
    const res = await request(app).delete(`/api/carts/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Confirm deletion
    const check = await request(app).get(`/api/carts/${createdId}`);
    expect(check.statusCode).toBe(404);
  });
});
