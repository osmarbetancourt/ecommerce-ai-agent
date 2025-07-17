import request from 'supertest';
import { createApp } from '../src/index';

const app = createApp();

describe('Carts API integration', () => {
  let createdId: number | undefined;
  let testCategoryId: number | undefined;
  let testProductId: number | undefined;
  const isTestEnv = process.env.NODE_ENV === 'test';

  beforeAll(async () => {
    // Create a test category for product FK
    const category = { name: 'Test Category' };
    const res = await request(app).post('/api/categories').send(category);
    if (res.statusCode === 201 && res.body.id) {
      testCategoryId = res.body.id;
    }
  });

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

  describe('Cart Items API integration', () => {
    let createdCartItemId: number | undefined;
    let testProductId: number | undefined;
    const isTestEnv = process.env.NODE_ENV === 'test';

    // You may need to create a product first for product_id
    beforeAll(async () => {
      // Create a test product if needed
      // Create a cart
      const cartRes = await request(app).post('/api/carts').send({});
      if (cartRes.statusCode === 201 && cartRes.body.id) {
        createdId = cartRes.body.id;
      }
      // Create a product with valid category
      if (!testCategoryId) return;
      const product = { name: 'Test Product', price: 1.99, category_id: testCategoryId };
      const prodRes = await request(app).post('/api/products').send(product);
      if (prodRes.statusCode === 201 && prodRes.body.id) {
        testProductId = prodRes.body.id;
      }
    });

    it('GET /api/cart-items should return an array', async () => {
      const res = await request(app).get('/api/cart-items');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/cart-items/cart/:cartId should return an array for the created cart', async () => {
      if (!createdId) return;
      const res = await request(app).get(`/api/cart-items/cart/${createdId}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/cart-items/:id with non-existent id should return 404', async () => {
      const res = await request(app).get('/api/cart-items/999999');
      expect(res.statusCode).toBe(404);
    });

    (isTestEnv ? it : it.skip)('POST /api/cart-items should add an item to the cart', async () => {
      if (!createdId || !testProductId) return;
      const cartItem = { cart_id: createdId, product_id: testProductId, quantity: 2 };
      const res = await request(app).post('/api/cart-items').send(cartItem);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('cart_id', createdId);
      expect(res.body).toHaveProperty('product_id', testProductId);
      createdCartItemId = res.body.id;
    });

    (isTestEnv ? it : it.skip)('GET /api/cart-items/:id should return the created cart item', async () => {
      if (!createdCartItemId) return;
      const res = await request(app).get(`/api/cart-items/${createdCartItemId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', createdCartItemId);
      expect(res.body).toHaveProperty('cart_id', createdId);
    });

    (isTestEnv ? it : it.skip)('PUT /api/cart-items/:id should update the cart item', async () => {
      if (!createdCartItemId) return;
      const update = { quantity: 5 };
      const res = await request(app).put(`/api/cart-items/${createdCartItemId}`).send(update);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', createdCartItemId);
      expect(res.body).toHaveProperty('quantity', 5);
    });

    (isTestEnv ? it : it.skip)('DELETE /api/cart-items/:id should delete the cart item', async () => {
      if (!createdCartItemId) return;
      const res = await request(app).delete(`/api/cart-items/${createdCartItemId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      // Confirm deletion
      const check = await request(app).get(`/api/cart-items/${createdCartItemId}`);
      expect(check.statusCode).toBe(404);
    });

    it('POST /api/cart-items with non-existent cart_id should return 400', async () => {
      if (!testProductId) return;
      const cartItem = { cart_id: 999999, product_id: testProductId, quantity: 1 };
      const res = await request(app).post('/api/cart-items').send(cartItem);
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Cart does not exist');
    });
  });
});
