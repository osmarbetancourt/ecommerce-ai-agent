import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
// Get allowed origins from environment variable, fallback to localhost
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:5000").split(",");
import csrf from "csurf";
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Rate limiting middleware
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
});

// Helmet for security headers
export const securityHeaders = helmet();

// CORS middleware (customize origin as needed)
export const corsMiddleware = cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
});

// CSRF protection (for cookie-based JWT)
export const csrfProtection = csrf({ cookie: true });

// Input validation example (use per-route)
export const validateCartItem = [
  body("cart_id").isInt(),
  body("product_id").isInt(),
  body("quantity").isInt({ min: 1 }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
