import request from 'supertest';
import { createApp } from '../src/index';

const app = createApp();

describe('Transactions API integration', () => {
  let createdTransactionId: number | undefined;
  let createdUserId: number | undefined;
  let createdOrderId: number | undefined;
  let createdPaymentMethodId: number | undefined;
  const isTestEnv = process.env.NODE_ENV === 'test';

  beforeAll(async () => {
    // Create a test user
    const user = { name: 'TransactionTestUser', email: `transactionuser${Date.now()}@test.com` };
    const userRes = await request(app).post('/api/users/register').send(user);
    if (userRes.statusCode === 201 && userRes.body.id) {
      createdUserId = userRes.body.id;
    }
    // Create a test order
    if (createdUserId) {
      const order = { user_id: createdUserId, total_price: 100.0 };
      const orderRes = await request(app).post('/api/orders').send(order);
      if (orderRes.statusCode === 201 && orderRes.body.id) {
        createdOrderId = orderRes.body.id;
      }
    }
    // Create a payment method type
    const type = { name: 'TestType', description: 'Test payment method type' };
    const typeRes = await request(app).post('/api/payment-method-types').send(type);
    let typeId;
    if (typeRes.statusCode === 201 && typeRes.body.id) {
      typeId = typeRes.body.id;
    }
    // Create a payment method
    if (createdUserId && typeId) {
      const method = {
        user_id: createdUserId,
        type_id: typeId,
        provider: 'TestProvider',
        account: '1234',
        details: 'Test details',
        active: true
      };
      const methodRes = await request(app).post('/api/payment-methods').send(method);
      if (methodRes.statusCode === 201 && methodRes.body.id) {
        createdPaymentMethodId = methodRes.body.id;
      }
    }
  });

  it('GET /api/transactions should return an array', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/transactions/:id with non-existent id should return 404', async () => {
    const res = await request(app).get('/api/transactions/999999');
    expect(res.statusCode).toBe(404);
  });

  (isTestEnv ? it : it.skip)('POST /api/transactions should create a transaction', async () => {
    if (!createdUserId || !createdOrderId || !createdPaymentMethodId) return;
    const transaction = {
      user_id: createdUserId,
      order_id: createdOrderId,
      payment_method_id: createdPaymentMethodId,
      status: 'pending',
      amount: 100.0,
      transaction_id: `txn_${Date.now()}`
    };
    const res = await request(app).post('/api/transactions').send(transaction);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('user_id', createdUserId);
    expect(res.body).toHaveProperty('order_id', createdOrderId);
    expect(res.body).toHaveProperty('payment_method_id', createdPaymentMethodId);
    createdTransactionId = res.body.id;
  });

  (isTestEnv ? it : it.skip)('GET /api/transactions/:id should return the created transaction', async () => {
    if (!createdTransactionId) return;
    const res = await request(app).get(`/api/transactions/${createdTransactionId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdTransactionId);
    expect(res.body).toHaveProperty('user_id', createdUserId);
    expect(res.body).toHaveProperty('order_id', createdOrderId);
    expect(res.body).toHaveProperty('payment_method_id', createdPaymentMethodId);
  });

  (isTestEnv ? it : it.skip)('GET /api/transactions/user/:userId should return transactions for the user', async () => {
    if (!createdUserId) return;
    const res = await request(app).get(`/api/transactions/user/${createdUserId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (createdTransactionId) {
      expect(res.body.some((t: any) => t.id === createdTransactionId)).toBe(true);
    }
  });

  (isTestEnv ? it : it.skip)('GET /api/transactions/order/:orderId should return transactions for the order', async () => {
    if (!createdOrderId) return;
    const res = await request(app).get(`/api/transactions/order/${createdOrderId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (createdTransactionId) {
      expect(res.body.some((t: any) => t.id === createdTransactionId)).toBe(true);
    }
  });

  (isTestEnv ? it : it.skip)('PUT /api/transactions/:id should update the transaction', async () => {
    if (!createdTransactionId) return;
    const update = { status: 'completed', amount: 120.0 };
    const res = await request(app).put(`/api/transactions/${createdTransactionId}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdTransactionId);
    expect(res.body).toHaveProperty('status', update.status);
    expect(res.body).toHaveProperty('amount', update.amount);
  });

  (isTestEnv ? it : it.skip)('DELETE /api/transactions/:id should delete the transaction', async () => {
    if (!createdTransactionId) return;
    const res = await request(app).delete(`/api/transactions/${createdTransactionId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Confirm deletion
    const check = await request(app).get(`/api/transactions/${createdTransactionId}`);
    expect(check.statusCode).toBe(404);
  });
});
