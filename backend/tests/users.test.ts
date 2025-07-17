
import knex from 'knex';
import config from '../knexfile';
import request from 'supertest';
import { createApp } from '../src/index';

const app = createApp();
const isTestEnv = process.env.NODE_ENV === 'test';
const db = knex(config['test']);

describe('Users API integration', () => {
  // Mock Google OAuth2Client for tests
  const mockPayload = {
    sub: 'google123',
    email: 'googleuser@test.com',
    name: 'Google User',
    picture: 'avatar.png',
  };
  let verifyIdTokenMock: any;
  beforeAll(() => {
    // Mock the google-auth-library OAuth2Client
    const { OAuth2Client } = require('google-auth-library');
    verifyIdTokenMock = jest.fn();
    OAuth2Client.prototype.verifyIdToken = verifyIdTokenMock;
  });

  (isTestEnv ? it : it.skip)('POST /api/users/oauth/google should create a user with valid token', async () => {
    verifyIdTokenMock.mockResolvedValue({ getPayload: () => mockPayload });
    const res = await request(app).post('/api/users/oauth/google').send({ idToken: 'valid-token' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('google_id', mockPayload.sub);
    expect(res.body).toHaveProperty('email', mockPayload.email);
    expect(res.body).toHaveProperty('name', mockPayload.name);
    expect(res.body).toHaveProperty('avatar_url', mockPayload.picture);
  });

  (isTestEnv ? it : it.skip)('POST /api/users/oauth/google with missing idToken should return 400', async () => {
    const res = await request(app).post('/api/users/oauth/google').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'idToken is required');
  });

  (isTestEnv ? it : it.skip)('POST /api/users/oauth/google with invalid token should return 401', async () => {
    verifyIdTokenMock.mockResolvedValue({ getPayload: () => null });
    const res = await request(app).post('/api/users/oauth/google').send({ idToken: 'invalid-token' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid Google token');
  });

  (isTestEnv ? it : it.skip)('POST /api/users/oauth/google with token missing required fields should return 400', async () => {
    verifyIdTokenMock.mockResolvedValue({ getPayload: () => ({}) });
    const res = await request(app).post('/api/users/oauth/google').send({ idToken: 'missing-fields-token' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Google token missing required fields');
  });

  (isTestEnv ? it : it.skip)('POST /api/users/oauth/google for existing user should update last_login and avatar', async () => {
    // First call creates user
    verifyIdTokenMock.mockResolvedValue({ getPayload: () => mockPayload });
    await request(app).post('/api/users/oauth/google').send({ idToken: 'valid-token' });
    // Second call should update last_login and avatar_url
    const res = await request(app).post('/api/users/oauth/google').send({ idToken: 'valid-token' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('google_id', mockPayload.sub);
    expect(res.body).toHaveProperty('avatar_url', mockPayload.picture);
    expect(res.body).toHaveProperty('last_login');
  });
  let createdUserId: number | undefined;
  let testEmail = `user${Date.now()}@test.com`;

  it('GET /api/users should return an array', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  (isTestEnv ? it : it.skip)('POST /api/users/register should create a user', async () => {
    const user = { name: 'Test User', email: testEmail };
    const res = await request(app).post('/api/users/register').send(user);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', testEmail);
    createdUserId = res.body.id;
  });

  (isTestEnv ? it : it.skip)('POST /api/users/register with existing email should return 400', async () => {
    const user = { name: 'Test User', email: testEmail };
    const res = await request(app).post('/api/users/register').send(user);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email already registered');
  });

  (isTestEnv ? it : it.skip)('PUT /api/users/:id should update user profile', async () => {
    if (!createdUserId) return;
    const update = { name: 'Updated User', address: '123 Main St', phone: '555-1234', avatar: 'avatar.png', roles: 'admin' };
    const res = await request(app).put(`/api/users/${createdUserId}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated User');
    expect(res.body).toHaveProperty('address', '123 Main St');
    expect(res.body).toHaveProperty('phone', '555-1234');
    expect(res.body).toHaveProperty('avatar_url', 'avatar.png');
    expect(res.body).toHaveProperty('role', 'admin');
  });

  (isTestEnv ? it : it.skip)('DELETE /api/users/:id should delete the user', async () => {
    if (!createdUserId) return;
    const res = await request(app).delete(`/api/users/${createdUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Confirm deletion
    const check = await request(app).get('/api/users');
    const found = check.body.find((u: any) => u.id === createdUserId);
    expect(found).toBeUndefined();
  });

  it('POST /api/users/register missing fields should return 400', async () => {
    const res = await request(app).post('/api/users/register').send({ name: 'No Email' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'email is required');
  });
});
