import { Router } from 'express';
import { jwtMiddleware, requireAdmin } from '../middleware/auth';
import knex from 'knex';
import config from '../../knexfile';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);
const router = Router();
// Google OAuth login/register
router.post('/oauth/google', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    // Exchange code for tokens
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !REDIRECT_URI) {
      return res.status(500).json({ error: 'Google OAuth environment variables missing' });
    }
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.id_token) {
      return res.status(400).json({ error: 'Failed to exchange code for id_token' });
    }
    // Verify id_token
    const ticket = await oauthClient.verifyIdToken({
      idToken: tokenData.id_token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }
    const google_id = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const avatar_url = payload.picture;
    if (!google_id || !email) {
      return res.status(400).json({ error: 'Google token missing required fields' });
    }
    // Find or create user
    let user = await db('user').where({ google_id }).orWhere({ email }).first();
    if (!user) {
      const inserted: any = await db('user').insert({
        google_id,
        email,
        name,
        avatar_url,
        last_login: new Date(),
      }).returning('id');
      let id;
      if (Array.isArray(inserted)) {
        if (typeof inserted[0] === 'object' && inserted[0] !== null && 'id' in inserted[0]) {
          id = inserted[0].id;
        } else {
          id = inserted[0];
        }
      } else if (typeof inserted === 'object' && inserted !== null && 'id' in inserted) {
        id = inserted.id;
      } else {
        id = inserted;
      }
      user = await db('user').where({ id: Number(id) }).first();
    } else {
      // Update last_login and avatar_url
      await db('user').where({ id: user.id }).update({ last_login: new Date(), avatar_url });
      user = await db('user').where({ id: user.id }).first();
      console.log('[Google OAuth] Existing user updated:', user);
    }

    // Issue JWT/session token
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
    const tokenPayload = {
      id: user.id,
      email: user.email,
      google_id: user.google_id,
      name: user.name,
      avatar_url: user.avatar_url,
      role: user.role || null,
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
    // Set JWT as httpOnly cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: (err as any)?.message || 'Google OAuth failed' });
  }
});


// List all users
// List all users (admin only)
router.get('/', jwtMiddleware, requireAdmin, async (req, res) => {
  try {
    const users = await db('user').select('*');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Register a new user
// Register a new user (public)
router.post('/register', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }
    // Check for existing email
    const existing = await db('user').where({ email }).first();
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const inserted: any = await db('user').insert({ name, email }).returning('id');
    let id;
    if (Array.isArray(inserted)) {
      if (typeof inserted[0] === 'object' && inserted[0] !== null && 'id' in inserted[0]) {
        id = inserted[0].id;
      } else {
        id = inserted[0];
      }
    } else if (typeof inserted === 'object' && inserted !== null && 'id' in inserted) {
      id = inserted.id;
    } else {
      id = inserted;
    }
    const newUser = await db('user').where({ id: Number(id) }).first();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: (err as any)?.message || 'Failed to register user' });
  }
});

// Login (update last_login)
// Remove password login endpoint (Google OAuth only)

// Update user profile (name, address, phone, avatar, roles)
// Update user profile (owner or admin)
router.put('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  if (!isAdmin && Number(req.params.id) !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    // Use avatar_url instead of avatar, and role instead of roles
    const updateData = { ...req.body };
    if ('avatar' in updateData) {
      updateData.avatar_url = updateData.avatar;
      delete updateData.avatar;
    }
    if ('roles' in updateData) {
      updateData.role = updateData.roles;
      delete updateData.roles;
    }
    const updated = await db('user').where({ id: Number(req.params.id) }).update(updateData);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    const user = await db('user').where({ id: Number(req.params.id) }).first();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update user' });
  }
});

// Delete user
// Delete user (admin only)
router.delete('/:id', jwtMiddleware, requireAdmin, async (req, res) => {
  try {
    const deleted = await db('user').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete user' });
  }
});

// Get current user info from JWT in cookie
// Get current user info from JWT in cookie (authenticated only)
router.get('/me', jwtMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    // Fetch user from DB to ensure fresh info
    const user = await db('user').where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

export default router;