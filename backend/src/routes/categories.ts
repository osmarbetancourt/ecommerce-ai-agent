import { Router } from 'express';
import knex from 'knex';
import config from '../../knexfile';
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
    const inserted = await db('category').insert(req.body).returning('id');
    let id = Array.isArray(inserted) ? (inserted[0]?.id ?? inserted[0]) : inserted;
    const newCategory = await db('category').where({ id }).first();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await db('category').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    const category = await db('category').where({ id: Number(req.params.id) }).first();
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('category').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete category' });
  }
});

export default router;
