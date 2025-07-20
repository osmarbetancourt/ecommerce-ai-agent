import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.jwt;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Attach user info to request for downstream use
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if ((req as any).user && (req as any).user.role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Forbidden: Admins only" });
}
