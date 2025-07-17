import request from 'supertest';
import { createApp } from '../src/index';

const app = createApp();

describe('Search Index API integration', () => {
  let createdEntryId: number | undefined;
  const isTestEnv = process.env.NODE_ENV === 'test';

  it('GET /api/search-index should return an array', async () => {
    const res = await request(app).get('/api/search-index');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/search-index/:id with non-existent id should return 404', async () => {
    const res = await request(app).get('/api/search-index/999999');
    expect(res.statusCode).toBe(404);
  });

  (isTestEnv ? it : it.skip)('POST /api/search-index should add an entry', async () => {
    const entry = {
      type: 'product',
      ref_id: 1,
      keywords: 'test,search,index',
      updated_at: new Date().toISOString()
    };
    const res = await request(app).post('/api/search-index').send(entry);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('type', entry.type);
    createdEntryId = res.body.id;
  });

  (isTestEnv ? it : it.skip)('GET /api/search-index/:id should return the created entry', async () => {
    if (!createdEntryId) return;
    const res = await request(app).get(`/api/search-index/${createdEntryId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdEntryId);
    expect(res.body).toHaveProperty('type');
  });

  (isTestEnv ? it : it.skip)('GET /api/search-index/search?q=test should return matching entries', async () => {
    const res = await request(app).get('/api/search-index/search?q=test');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (createdEntryId) {
      expect(res.body.some((e: any) => e.id === createdEntryId)).toBe(true);
    }
  });

  (isTestEnv ? it : it.skip)('PUT /api/search-index/:id should update the entry', async () => {
    if (!createdEntryId) return;
    const update = { keywords: 'updated,search,index' };
    const res = await request(app).put(`/api/search-index/${createdEntryId}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdEntryId);
    expect(res.body).toHaveProperty('keywords', update.keywords);
  });

  (isTestEnv ? it : it.skip)('DELETE /api/search-index/:id should delete the entry', async () => {
    if (!createdEntryId) return;
    const res = await request(app).delete(`/api/search-index/${createdEntryId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Confirm deletion
    const check = await request(app).get(`/api/search-index/${createdEntryId}`);
    expect(check.statusCode).toBe(404);
  });
});
