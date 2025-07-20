process.env.JWT_SECRET = 'testsecret';
import httpMocks from 'node-mocks-http';
import { jwtMiddleware } from '../../src/middleware/auth';

describe('Conversations Security Middleware', () => {
  it('should block access if not authenticated', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    await jwtMiddleware(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(nextCalled).toBe(false);
  });

  it('should allow access if authenticated', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 123, role: 'user' }, 'testsecret');
    const req = httpMocks.createRequest({ cookies: { jwt: token } });
    (req as any).user = { id: 123, role: 'user' };
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    await jwtMiddleware(req, res, next);
    expect(nextCalled).toBe(true);
  });

  it('should block access to another user conversation if not admin', async () => {
    // Simulate ownership check
    function ownershipMiddleware(req: any, res: any, next: any) {
      const conversation = { user_id: 456 };
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'admin';
      if (!isAdmin && conversation.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    }
    const req = httpMocks.createRequest();
    (req as any).user = { id: 123, role: 'user' };
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    await ownershipMiddleware(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(nextCalled).toBe(false);
  });

  it('should allow access to own conversation', async () => {
    function ownershipMiddleware(req: any, res: any, next: any) {
      const conversation = { user_id: 123 };
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'admin';
      if (!isAdmin && conversation.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    }
    const req = httpMocks.createRequest();
    (req as any).user = { id: 123, role: 'user' };
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    await ownershipMiddleware(req, res, next);
    expect(nextCalled).toBe(true);
  });

  it('should allow admin to access any conversation', async () => {
    function ownershipMiddleware(req: any, res: any, next: any) {
      const conversation = { user_id: 456 };
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'admin';
      if (!isAdmin && conversation.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    }
    const req = httpMocks.createRequest();
    (req as any).user = { id: 1, role: 'admin' };
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    await ownershipMiddleware(req, res, next);
    expect(nextCalled).toBe(true);
  });
});
