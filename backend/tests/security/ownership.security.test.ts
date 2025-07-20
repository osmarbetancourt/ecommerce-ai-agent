import { Request, Response, NextFunction } from 'express';
import httpMocks from 'node-mocks-http';

describe('Ownership Middleware Security', () => {
  function ownershipMiddleware(req: Request, res: Response, next: NextFunction) {
    // Simulate resource ownership check
    const resourceOwnerId = (req as any).resourceOwnerId;
    const userId = (req as any).user?.id;
    if (resourceOwnerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this resource' });
    }
    next();
  }

  it('should allow access when user owns the resource', async () => {
    const req = httpMocks.createRequest();
    req.resourceOwnerId = 123;
    (req as any).user = { id: 123 };
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await ownershipMiddleware(req, res, next);
    expect(nextCalled).toBe(true);
  });

  it('should block access when user does not own the resource', async () => {
    const req = httpMocks.createRequest();
    req.resourceOwnerId = 456;
    (req as any).user = { id: 123 };
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await ownershipMiddleware(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(nextCalled).toBe(false);
  });
});
