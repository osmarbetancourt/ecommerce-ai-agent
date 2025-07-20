import { Router } from 'express';
import knex from 'knex';
import config from '../../knexfile';
import { jwtMiddleware, requireAdmin } from '../middleware/auth';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

router.get('/', async (req, res) => {
  try {
    const categories = await db('category').select('*');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await db('category').where({ id: Number(req.params.id) }).first();
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    // Check for duplicate name
    const existing = await db('category').whereRaw('LOWER(name) = ?', [name.toLowerCase()]).first();
    if (existing) {
      return res.status(409).json({ error: 'Category with this name already exists' });
    }
    const inserted = await db('category').insert({ name }).returning('id');
    let id = Array.isArray(inserted) ? (inserted[0]?.id ?? inserted[0]) : inserted;
    const newCategory = await db('category').where({ id }).first();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create category' });
  }
});



router.put('/:id', jwtMiddleware, requireAdmin, async (req, res) => {
  try {
    const updated = await db('category').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    const category = await db('category').where({ id: Number(req.params.id) }).first();
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', jwtMiddleware, requireAdmin, async (req, res) => {
  try {
    const deleted = await db('category').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete category' });
  }
});

export default router;
