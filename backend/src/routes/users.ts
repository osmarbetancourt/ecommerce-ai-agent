import { Router } from 'express';
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
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }
    // Verify token
    const ticket = await oauthClient.verifyIdToken({
      idToken,
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
    }
    res.json(user);
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(400).json({ error: (err as any)?.message || 'Google OAuth failed' });
  }
});


// List all users
router.get('/', async (req, res) => {
// Google OAuth login/register
router.post('/oauth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }
    // Verify token
    const ticket = await oauthClient.verifyIdToken({
      idToken,
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
      const [id] = await db('user').insert({
        google_id,
        email,
        name,
        avatar_url,
        last_login: new Date(),
      }).returning('id');
      user = await db('user').where({ id }).first();
    } else {
      // Update last_login and avatar_url
      await db('user').where({ id: user.id }).update({ last_login: new Date(), avatar_url });
      user = await db('user').where({ id: user.id }).first();
    }
    res.json(user);
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(400).json({ error: (err as any)?.message || 'Google OAuth failed' });
  }
});
  try {
    const users = await db('user').select('*');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Register a new user
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('user').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete user' });
  }
});

export default router;
