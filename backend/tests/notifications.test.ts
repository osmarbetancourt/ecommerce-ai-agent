import request from 'supertest';
import { createApp } from '../src/index';

const app = createApp();

describe('Notifications API integration', () => {
  let createdId: number | undefined;
  let testUserId: number | undefined;
  const isTestEnv = process.env.NODE_ENV === 'test';

  beforeAll(async () => {
    // Create a test user for notification FK
    const user = { name: 'NotifTestUser', email: `notifuser${Date.now()}@test.com` };
    const res = await request(app).post('/api/users/register').send(user);
    if (res.statusCode === 201 && res.body.id) {
      testUserId = res.body.id;
    }
  });

  it('GET /api/notifications should return an array', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/notifications/:id with non-existent id should return 404', async () => {
    const res = await request(app).get('/api/notifications/999999');
    expect(res.statusCode).toBe(404);
  });

  (isTestEnv ? it : it.skip)('POST /api/notifications should create a notification', async () => {
    if (!testUserId) return;
    const notification = {
      user_id: testUserId,
      type: 'info',
      content: 'Test notification',
      read: false
    };
    const res = await request(app).post('/api/notifications').send(notification);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('user_id', testUserId);
    expect(res.body).toHaveProperty('type', notification.type);
    expect(res.body).toHaveProperty('content', notification.content);
    expect(res.body).toHaveProperty('read', false);
    createdId = res.body.id;
  });

  (isTestEnv ? it : it.skip)('GET /api/notifications/:id should return the created notification', async () => {
    if (!createdId) return;
    const res = await request(app).get(`/api/notifications/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
    expect(res.body).toHaveProperty('user_id', testUserId);
  });

  (isTestEnv ? it : it.skip)('PUT /api/notifications/:id should mark notification as read', async () => {
    if (!createdId) return;
    const update = { read: true };
    const res = await request(app).put(`/api/notifications/${createdId}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
    expect(res.body).toHaveProperty('read', true);
  });

  (isTestEnv ? it : it.skip)('DELETE /api/notifications/:id should delete the notification', async () => {
    if (!createdId) return;
    const res = await request(app).delete(`/api/notifications/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Confirm deletion
    const check = await request(app).get(`/api/notifications/${createdId}`);
    expect(check.statusCode).toBe(404);
  });

  it('POST /api/notifications with non-existent user_id should return 400', async () => {
    const notification = {
      user_id: 999999,
      type: 'info',
      content: 'Should fail',
      read: false
    };
    const res = await request(app).post('/api/notifications').send(notification);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
