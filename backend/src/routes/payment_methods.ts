import { Router } from 'express';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

// List all payment methods
router.get('/', async (req, res) => {
  try {
    const methods = await db('payment_method').select('*');
    res.json(methods);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// Get payment methods by user id
router.get('/user/:userId', async (req, res) => {
  try {
    const methods = await db('payment_method').where({ user_id: req.params.userId });
    res.json(methods);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment methods for user' });
  }
});

// Get a single payment method by id
router.get('/:id', async (req, res) => {
  try {
    const method = await db('payment_method').where({ id: Number(req.params.id) }).first();
    if (!method) return res.status(404).json({ error: 'Payment method not found' });
    res.json(method);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment method' });
  }
});

// Add a payment method
router.post('/', async (req, res) => {
  try {
    const inserted: any = await db('payment_method').insert(req.body).returning('id');
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
    const newMethod = await db('payment_method').where({ id: Number(id) }).first();
    res.status(201).json(newMethod);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add payment method' });
  }
});

// Update a payment method
router.put('/:id', async (req, res) => {
  try {
    const updated = await db('payment_method').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Payment method not found' });
    const method = await db('payment_method').where({ id: Number(req.params.id) }).first();
    res.json(method);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update payment method' });
  }
});

// Delete a payment method
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('payment_method').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Payment method not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete payment method' });
  }
});

export default router;
