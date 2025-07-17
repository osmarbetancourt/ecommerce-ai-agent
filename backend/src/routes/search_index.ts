import { Router } from 'express';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

// List all search index entries
router.get('/', async (req, res) => {
  try {
    const entries = await db('search_index').select('*');
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch search index entries' });
  }
});

// Search by keyword (simple LIKE search)
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing search query' });
  try {
    const entries = await db('search_index').whereRaw('LOWER(keywords) LIKE ?', [`%${String(q).toLowerCase()}%`]);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search index' });
  }
});

// Get a single search index entry by id
router.get('/:id', async (req, res) => {
  try {
    const entry = await db('search_index').where({ id: Number(req.params.id) }).first();
    if (!entry) return res.status(404).json({ error: 'Search index entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch search index entry' });
  }
});

// Add a search index entry
router.post('/', async (req, res) => {
  try {
    const inserted: any = await db('search_index').insert(req.body).returning('id');
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
    const newEntry = await db('search_index').where({ id: Number(id) }).first();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add search index entry' });
  }
});

// Update a search index entry
router.put('/:id', async (req, res) => {
  try {
    const updated = await db('search_index').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Search index entry not found' });
    const entry = await db('search_index').where({ id: Number(req.params.id) }).first();
    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update search index entry' });
  }
});

// Delete a search index entry
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('search_index').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Search index entry not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete search index entry' });
  }
});

export default router;
