process.env.JWT_SECRET = 'testsecret';
import { jwtMiddleware } from '../../src/middleware/auth';
import httpMocks from 'node-mocks-http';

describe('JWT Middleware Security', () => {
  it('should block requests without JWT', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await jwtMiddleware(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(nextCalled).toBe(false);
  });

  it('should block requests with invalid JWT', async () => {
    const req = httpMocks.createRequest({
      headers: { authorization: 'Bearer faketoken' }
    });
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await jwtMiddleware(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(nextCalled).toBe(false);
  });

  // Add more middleware-only tests as needed
  it('should allow requests with valid JWT', async () => {
    // Replace 'testsecret' with your actual JWT secret
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 123 }, 'testsecret');
    const req = httpMocks.createRequest({
      cookies: { jwt: token }
    });
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await jwtMiddleware(req, res, next);
    expect(nextCalled).toBe(true);
  });

  it('should block requests with JWT missing user id', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({}, 'testsecret');
    const req = httpMocks.createRequest({
      headers: { authorization: `Bearer ${token}` }
    });
    const res = httpMocks.createResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await jwtMiddleware(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(nextCalled).toBe(false);
  });

  // If you have role-based middleware, add tests for admin/non-admin access here
});
