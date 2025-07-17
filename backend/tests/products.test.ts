import request from 'supertest';
import { createApp } from '../src/index';

const app = createApp();

describe('Products API integration', () => {
  let createdId: number | undefined;
  let testCategoryId: number | undefined;

  beforeAll(async () => {
    // Create a test category for product FK
    const category = { name: 'Test Category' };
    const res = await request(app).post('/api/categories').send(category);
    if (res.statusCode === 201 && res.body.id) {
      testCategoryId = res.body.id;
    }
  });
  // Always create a test category for products
  beforeAll(async () => {
    const category = { name: 'Test Category' };
    const res = await request(app).post('/api/categories').send(category);
    if (res.statusCode === 201 && res.body.id) {
      testCategoryId = res.body.id;
    }
  });

  it('GET /api/products should return an array', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/products/:id with non-existent id should return 404', async () => {
    const res = await request(app).get('/api/products/999999');
    expect(res.statusCode).toBe(404);
  });

  // Only run mutating tests if NODE_ENV is 'test'
  const isTestEnv = process.env.NODE_ENV === 'test';
  (isTestEnv ? it : it.skip)('POST /api/products should create a product', async () => {
    if (!testCategoryId) return;
    const product = { name: 'Test Product', price: 9.99, category_id: testCategoryId };
    const res = await request(app).post('/api/products').send(product);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(product.name);
    createdId = res.body.id;
  });

  (isTestEnv ? it : it.skip)('GET /api/products/:id should return the created product', async () => {
    if (!createdId) return;
    const res = await request(app).get(`/api/products/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
  });

  (isTestEnv ? it : it.skip)('PUT /api/products/:id should update the product', async () => {
    if (!createdId) return;
    const update = { name: 'Updated Product', price: 19.99 };
    const res = await request(app).put(`/api/products/${createdId}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(update.name);
    expect(res.body.price).toBe(update.price);
  });

  (isTestEnv ? it : it.skip)('DELETE /api/products/:id should delete the product', async () => {
    if (!createdId) return;
    const res = await request(app).delete(`/api/products/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Confirm deletion
    const check = await request(app).get(`/api/products/${createdId}`);
    expect(check.statusCode).toBe(404);
  });

  (isTestEnv ? it : it.skip)('POST /api/products without category_id should fail with 400', async () => {
    const product = { name: 'No Category Product', price: 5.99, description: 'Should fail' };
    const res = await request(app).post('/api/products').send(product);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
