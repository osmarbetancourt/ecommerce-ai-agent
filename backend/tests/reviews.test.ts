import request from 'supertest';
import { createApp } from '../src/index';

const app = createApp();

describe('Reviews API integration', () => {
  let createdReviewId: number | undefined;
  let createdProductId: number | undefined;
  let createdUserId: number | undefined;
  const isTestEnv = process.env.NODE_ENV === 'test';

  beforeAll(async () => {
    // Create a test user
    const user = { name: 'ReviewTestUser', email: `reviewuser${Date.now()}@test.com` };
    const userRes = await request(app).post('/api/users/register').send(user);
    if (userRes.statusCode === 201 && userRes.body.id) {
      createdUserId = userRes.body.id;
    }
    // Create a test product
    const product = { name: 'ReviewTestProduct', description: 'Test product', price: 10.0, category_id: 1 };
    const productRes = await request(app).post('/api/products').send(product);
    if (productRes.statusCode === 201 && productRes.body.id) {
      createdProductId = productRes.body.id;
    }
  });

  it('GET /api/reviews should return an array', async () => {
    const res = await request(app).get('/api/reviews');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/reviews/:id with non-existent id should return 404', async () => {
    const res = await request(app).get('/api/reviews/999999');
    expect(res.statusCode).toBe(404);
  });

  (isTestEnv ? it : it.skip)('POST /api/reviews should add a review', async () => {
    if (!createdProductId || !createdUserId) return;
    const review = {
      product_id: createdProductId,
      user_id: createdUserId,
      rating: 5,
      description: 'Great product!'
    };
    const res = await request(app).post('/api/reviews').send(review);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('product_id', createdProductId);
    expect(res.body).toHaveProperty('user_id', createdUserId);
    createdReviewId = res.body.id;
  });

  (isTestEnv ? it : it.skip)('GET /api/reviews/:id should return the created review', async () => {
    if (!createdReviewId) return;
    const res = await request(app).get(`/api/reviews/${createdReviewId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdReviewId);
    expect(res.body).toHaveProperty('product_id', createdProductId);
    expect(res.body).toHaveProperty('user_id', createdUserId);
  });

  (isTestEnv ? it : it.skip)('GET /api/reviews/product/:productId should return reviews for the product', async () => {
    if (!createdProductId) return;
    const res = await request(app).get(`/api/reviews/product/${createdProductId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (createdReviewId) {
      expect(res.body.some((r: any) => r.id === createdReviewId)).toBe(true);
    }
  });

  (isTestEnv ? it : it.skip)('PUT /api/reviews/:id should update the review', async () => {
    if (!createdReviewId) return;
    const update = { rating: 4, description: 'Updated comment' };
    const res = await request(app).put(`/api/reviews/${createdReviewId}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdReviewId);
    expect(res.body).toHaveProperty('rating', update.rating);
    expect(res.body).toHaveProperty('description', update.description);
  });

  (isTestEnv ? it : it.skip)('DELETE /api/reviews/:id should delete the review', async () => {
    if (!createdReviewId) return;
    const res = await request(app).delete(`/api/reviews/${createdReviewId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Confirm deletion
    const check = await request(app).get(`/api/reviews/${createdReviewId}`);
    expect(check.statusCode).toBe(404);
  });
});
