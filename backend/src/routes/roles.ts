import { Router } from 'express';
import { jwtMiddleware, requireAdmin } from '../middleware/auth';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

// List all roles
// List all roles (admin only)
router.get('/', jwtMiddleware, requireAdmin, async (req, res) => {
  try {
    const roles = await db('role').select('*');
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get a single role by id
// Get a single role by id (admin only)
router.get('/:id', jwtMiddleware, requireAdmin, async (req, res) => {
  try {
    const role = await db('role').where({ id: Number(req.params.id) }).first();
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json(role);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

// Add a role
router.post('/', jwtMiddleware, requireAdmin, async (req, res) => {
  try {
    const inserted: any = await db('role').insert(req.body).returning('id');
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
    const newRole = await db('role').where({ id: Number(id) }).first();
    res.status(201).json(newRole);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add role' });
  }
});

// Update a role
router.put('/:id', jwtMiddleware, requireAdmin, async (req, res) => {
  try {
    const updated = await db('role').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Role not found' });
    const role = await db('role').where({ id: Number(req.params.id) }).first();
    res.json(role);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update role' });
  }
});

// Delete a role
router.delete('/:id', jwtMiddleware, requireAdmin, async (req, res) => {
  try {
    const deleted = await db('role').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Role not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete role' });
  }
});

export default router;
