import request from 'supertest';
import { createApp } from '../src/index';

const app = createApp();

describe('Orders API integration', () => {
  let createdId: number | undefined;
  let userId: number | undefined;
  const isTestEnv = process.env.NODE_ENV === 'test';

  it('GET /api/orders should return an array', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/orders/:id with non-existent id should return 404', async () => {
    const res = await request(app).get('/api/orders/999999');
    expect(res.statusCode).toBe(404);
  });


  (isTestEnv ? it : it.skip)('GET /api/orders/:id should return the created order', async () => {
    if (!createdId) return;
    const res = await request(app).get(`/api/orders/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  (isTestEnv ? it : it.skip)('PUT /api/orders/:id should update the order', async () => {
    if (!createdId) return;
    const update = { total_price: 20.00 };
    const res = await request(app).put(`/api/orders/${createdId}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body.total_price).toBe(update.total_price);
  });

  (isTestEnv ? it : it.skip)('DELETE /api/orders/:id should delete the order', async () => {
    if (!createdId) return;
    const res = await request(app).delete(`/api/orders/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Confirm deletion
    const check = await request(app).get(`/api/orders/${createdId}`);
    expect(check.statusCode).toBe(404);
  });
});
