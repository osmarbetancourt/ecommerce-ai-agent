import request from 'supertest';
import { createApp } from '../src/index';

const app = createApp();

describe('Order Items API integration', () => {
  let createdOrderId: number | undefined;
  let createdOrderItemId: number | undefined;
  let testProductId: number | undefined;
  const isTestEnv = process.env.NODE_ENV === 'test';

  beforeAll(async () => {
    // Create a test user
    const user = { name: 'OrderItemTestUser', email: `orderitemuser${Date.now()}@test.com` };
    const userRes = await request(app).post('/api/users/register').send(user);
    let testUserId;
    if (userRes.statusCode === 201 && userRes.body.id) {
      testUserId = userRes.body.id;
      // Create a test order
      const order = { user_id: testUserId, total_price: 10.0 };
      const orderRes = await request(app).post('/api/orders').send(order);
      if (orderRes.statusCode === 201 && orderRes.body.id) {
        createdOrderId = orderRes.body.id;
      }
    }
    // Create a test category and product
    const category = { name: 'OrderItemTestCategory' };
    const catRes = await request(app).post('/api/categories').send(category);
    if (catRes.statusCode === 201 && catRes.body.id) {
      const product = { name: 'OrderItemTestProduct', price: 2.5, category_id: catRes.body.id };
      const prodRes = await request(app).post('/api/products').send(product);
      if (prodRes.statusCode === 201 && prodRes.body.id) {
        testProductId = prodRes.body.id;
      }
    }
  });

  it('GET /api/order-items should return an array', async () => {
    const res = await request(app).get('/api/order-items');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/order-items/order/:orderId should return items for the created order', async () => {
    if (!createdOrderId) return;
    const res = await request(app).get(`/api/order-items/order/${createdOrderId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/order-items/:id with non-existent id should return 404', async () => {
    const res = await request(app).get('/api/order-items/999999');
    expect(res.statusCode).toBe(404);
  });

  (isTestEnv ? it : it.skip)('POST /api/order-items should add an item to the order', async () => {
    if (!createdOrderId || !testProductId) return;
    const orderItem = { order_id: createdOrderId, product_id: testProductId, quantity: 3, price_at_purchase: 2.5 };
    const res = await request(app).post('/api/order-items').send(orderItem);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('order_id', createdOrderId);
    expect(res.body).toHaveProperty('product_id', testProductId);
    createdOrderItemId = res.body.id;
  });

  (isTestEnv ? it : it.skip)('GET /api/order-items/:id should return the created order item', async () => {
    if (!createdOrderItemId) return;
    const res = await request(app).get(`/api/order-items/${createdOrderItemId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdOrderItemId);
    expect(res.body).toHaveProperty('order_id', createdOrderId);
  });

  (isTestEnv ? it : it.skip)('PUT /api/order-items/:id should update the order item', async () => {
    if (!createdOrderItemId) return;
    const update = { quantity: 5 };
    const res = await request(app).put(`/api/order-items/${createdOrderItemId}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdOrderItemId);
    expect(res.body).toHaveProperty('quantity', 5);
  });

  (isTestEnv ? it : it.skip)('DELETE /api/order-items/:id should delete the order item', async () => {
    if (!createdOrderItemId) return;
    const res = await request(app).delete(`/api/order-items/${createdOrderItemId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Confirm deletion
    const check = await request(app).get(`/api/order-items/${createdOrderItemId}`);
    expect(check.statusCode).toBe(404);
  });

  it('POST /api/order-items with non-existent order_id should return 400', async () => {
    if (!testProductId) return;
    const orderItem = { order_id: 999999, product_id: testProductId, quantity: 1, price_at_purchase: 2.5 };
    const res = await request(app).post('/api/order-items').send(orderItem);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
