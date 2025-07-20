process.env.JWT_SECRET = 'testsecret';
import httpMocks from 'node-mocks-http';
import { jwtMiddleware, requireAdmin } from '../../src/middleware/auth';

describe('Categories Security Middleware', () => {
  it('should block update if not authenticated', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    await jwtMiddleware(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(nextCalled).toBe(false);
  });

  it('should block update if not admin', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 123, role: 'user' }, 'testsecret');
    const req = httpMocks.createRequest({ cookies: { jwt: token } });
    (req as any).user = { id: 123, role: 'user' };
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    await requireAdmin(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(nextCalled).toBe(false);
  });

  it('should allow update if admin', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 1, role: 'admin' }, 'testsecret');
    const req = httpMocks.createRequest({ cookies: { jwt: token } });
    (req as any).user = { id: 1, role: 'admin' };
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    await requireAdmin(req, res, next);
    expect(nextCalled).toBe(true);
  });
});
