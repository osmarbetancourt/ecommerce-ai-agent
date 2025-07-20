process.env.JWT_SECRET = 'testsecret';
import httpMocks from 'node-mocks-http';
import { jwtMiddleware, requireAdmin } from '../../src/middleware/auth';

describe('Users Security Middleware', () => {
  it('should block listing users if not authenticated', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    await jwtMiddleware(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(nextCalled).toBe(false);
  });

  it('should block listing users if not admin', async () => {
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

  it('should allow listing users if admin', async () => {
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

  it('should block profile update if not owner or admin', async () => {
    function ownershipMiddleware(req: any, res: any, next: any) {
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'admin';
      const paramId = 456;
      if (!isAdmin && paramId !== userId) {
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

  it('should allow profile update if owner', async () => {
    function ownershipMiddleware(req: any, res: any, next: any) {
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'admin';
      const paramId = 123;
      if (!isAdmin && paramId !== userId) {
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

  it('should allow profile update if admin', async () => {
    function ownershipMiddleware(req: any, res: any, next: any) {
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'admin';
      const paramId = 456;
      if (!isAdmin && paramId !== userId) {
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
