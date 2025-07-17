import request from 'supertest';
import { createApp } from '../src/index';

const app = createApp();

describe('Payment Methods API integration', () => {
  let createdUserId: number | undefined;
  let createdTypeId: number | undefined;
  let createdMethodId: number | undefined;
  const isTestEnv = process.env.NODE_ENV === 'test';

  beforeAll(async () => {
    // Create a test user
    const user = { name: 'PaymentTestUser', email: `paymentuser${Date.now()}@test.com` };
    const userRes = await request(app).post('/api/users/register').send(user);
    if (userRes.statusCode === 201 && userRes.body.id) {
      createdUserId = userRes.body.id;
    }
    // Create a payment method type
    const type = { name: 'TestType', description: 'Test payment method type' };
    const typeRes = await request(app).post('/api/payment-method-types').send(type);
    if (typeRes.statusCode === 201 && typeRes.body.id) {
      createdTypeId = typeRes.body.id;
    }
  });

  it('GET /api/payment-methods should return an array', async () => {
    const res = await request(app).get('/api/payment-methods');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/payment-methods/user/:userId should return methods for the created user', async () => {
    if (!createdUserId) return;
    const res = await request(app).get(`/api/payment-methods/user/${createdUserId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/payment-methods/:id with non-existent id should return 404', async () => {
    const res = await request(app).get('/api/payment-methods/999999');
    expect(res.statusCode).toBe(404);
  });

  (isTestEnv ? it : it.skip)('POST /api/payment-methods should add a payment method', async () => {
    if (!createdUserId || !createdTypeId) return;
    const method = {
      user_id: createdUserId,
      type_id: createdTypeId,
      provider: 'TestProvider',
      account: '1234',
      details: 'Test details',
      active: true
    };
    const res = await request(app).post('/api/payment-methods').send(method);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('user_id', createdUserId);
    expect(res.body).toHaveProperty('type_id', createdTypeId);
    createdMethodId = res.body.id;
  });

  (isTestEnv ? it : it.skip)('GET /api/payment-methods/:id should return the created payment method', async () => {
    if (!createdMethodId) return;
    const res = await request(app).get(`/api/payment-methods/${createdMethodId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdMethodId);
    expect(res.body).toHaveProperty('user_id', createdUserId);
  });

  (isTestEnv ? it : it.skip)('PUT /api/payment-methods/:id should update the payment method', async () => {
    if (!createdMethodId) return;
    const update = { provider: 'UpdatedProvider', active: false };
    const res = await request(app).put(`/api/payment-methods/${createdMethodId}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdMethodId);
    expect(res.body).toHaveProperty('provider', update.provider);
    expect(res.body).toHaveProperty('active', false);
  });

  (isTestEnv ? it : it.skip)('DELETE /api/payment-methods/:id should delete the payment method', async () => {
    if (!createdMethodId) return;
    const res = await request(app).delete(`/api/payment-methods/${createdMethodId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Confirm deletion
    const check = await request(app).get(`/api/payment-methods/${createdMethodId}`);
    expect(check.statusCode).toBe(404);
  });

  it('POST /api/payment-methods with non-existent user_id should return 400', async () => {
    if (!createdTypeId) return;
    const method = {
      user_id: 999999,
      type_id: createdTypeId,
      provider: 'TestProvider',
      account: '1234',
      details: 'Test details',
      active: true
    };
    const res = await request(app).post('/api/payment-methods').send(method);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Payment Method Types API integration', () => {
  let createdTypeId: number | undefined;
  const isTestEnv = process.env.NODE_ENV === 'test';

  beforeAll(async () => {
    // Create a payment method type
    const type = { name: 'TypeForTypeTest', description: 'Type test' };
    const typeRes = await request(app).post('/api/payment-method-types').send(type);
    if (typeRes.statusCode === 201 && typeRes.body.id) {
      createdTypeId = typeRes.body.id;
    }
  });

  it('GET /api/payment-method-types should return an array', async () => {
    const res = await request(app).get('/api/payment-method-types');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/payment-method-types/:id with non-existent id should return 404', async () => {
    const res = await request(app).get('/api/payment-method-types/999999');
    expect(res.statusCode).toBe(404);
  });

  (isTestEnv ? it : it.skip)('POST /api/payment-method-types should add a payment method type', async () => {
    const type = { name: 'AnotherType', description: 'Another type' };
    const res = await request(app).post('/api/payment-method-types').send(type);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', type.name);
    createdTypeId = res.body.id;
  });

  (isTestEnv ? it : it.skip)('GET /api/payment-method-types/:id should return the created type', async () => {
    if (!createdTypeId) return;
    const res = await request(app).get(`/api/payment-method-types/${createdTypeId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdTypeId);
    expect(res.body).toHaveProperty('name');
  });

  (isTestEnv ? it : it.skip)('PUT /api/payment-method-types/:id should update the type', async () => {
    if (!createdTypeId) return;
    const update = { description: 'Updated description' };
    const res = await request(app).put(`/api/payment-method-types/${createdTypeId}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdTypeId);
    expect(res.body).toHaveProperty('description', update.description);
  });

  (isTestEnv ? it : it.skip)('DELETE /api/payment-method-types/:id should delete the type', async () => {
    if (!createdTypeId) return;
    const res = await request(app).delete(`/api/payment-method-types/${createdTypeId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Confirm deletion
    const check = await request(app).get(`/api/payment-method-types/${createdTypeId}`);
    expect(check.statusCode).toBe(404);
  });
});
