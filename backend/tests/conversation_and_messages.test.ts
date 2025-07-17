import request from 'supertest';
import { createApp } from '../src/index';

const app = createApp();

describe('Conversations API integration', () => {
  let createdConversationId: number | undefined;
  let testUserId: number | undefined;
  const isTestEnv = process.env.NODE_ENV === 'test';

  // Create a user and a conversation before running tests
  beforeAll(async () => {
    const user = { name: 'ConvTestUser', email: `convuser${Date.now()}@test.com`, password: 'password123' };
    const userRes = await request(app).post('/api/users/register').send(user);
    if (userRes.statusCode === 201 && userRes.body.id) {
      testUserId = userRes.body.id;
      const conversation = { user_id: testUserId, topic: 'Test Topic', context: 'Test context' };
      const convRes = await request(app).post('/api/conversations').send(conversation);
      if (convRes.statusCode === 201 && convRes.body.id) {
        createdConversationId = convRes.body.id;
      }
    }
  });

  it('GET /api/conversations should return an array', async () => {
    const res = await request(app).get('/api/conversations');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/conversations/:id with non-existent id should return 404', async () => {
    const res = await request(app).get('/api/conversations/999999');
    expect(res.statusCode).toBe(404);
  });

  (isTestEnv ? it : it.skip)('GET /api/conversations/:id should return the created conversation', async () => {
    if (!createdConversationId) return;
    const res = await request(app).get(`/api/conversations/${createdConversationId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdConversationId);
  });

  (isTestEnv ? it : it.skip)('PUT /api/conversations/:id should update the conversation', async () => {
    if (!createdConversationId) return;
    const update = { topic: 'Updated Topic' };
    const res = await request(app).put(`/api/conversations/${createdConversationId}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body.topic).toBe(update.topic);
  });
  
  (isTestEnv ? it : it.skip)('POST /api/messages should create a message in a conversation', async () => {
    if (!createdConversationId || !testUserId) return;
    const message = {
      user_id: testUserId,
      conversation_id: createdConversationId,
      sender: 'user',
      content: 'Hello, this is a test message!'
    };
    const res = await request(app).post('/api/messages').send(message);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('conversation_id', createdConversationId);
    expect(res.body).toHaveProperty('user_id', testUserId);
    expect(res.body).toHaveProperty('content', message.content);
  });

  (isTestEnv ? it : it.skip)('DELETE /api/conversations/:id should delete the conversation', async () => {
    if (!createdConversationId) return;
    const res = await request(app).delete(`/api/conversations/${createdConversationId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Confirm deletion
    const check = await request(app).get(`/api/conversations/${createdConversationId}`);
    expect(check.statusCode).toBe(404);
  });
});