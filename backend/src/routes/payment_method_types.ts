import { Router } from 'express';
import { jwtMiddleware } from '../middleware/auth';
import { db } from '../index';

const router = Router();

// List all payment method types
router.get('/', jwtMiddleware, async (req, res) => {
  try {
    const types = await db('payment_method_type').select('*');
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment method types' });
  }
});

// Get a single payment method type by id
router.get('/:id', jwtMiddleware, async (req, res) => {
  try {
    const type = await db('payment_method_type').where({ id: Number(req.params.id) }).first();
    if (!type) return res.status(404).json({ error: 'Payment method type not found' });
    res.json(type);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment method type' });
  }
});

// Add a payment method type
router.post('/', jwtMiddleware, async (req, res) => {
  try {
    const inserted: any = await db('payment_method_type').insert(req.body).returning('id');
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
    const newType = await db('payment_method_type').where({ id: Number(id) }).first();
    res.status(201).json(newType);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add payment method type' });
  }
});

// Update a payment method type
router.put('/:id', jwtMiddleware, async (req, res) => {
  try {
    const updated = await db('payment_method_type').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Payment method type not found' });
    const type = await db('payment_method_type').where({ id: Number(req.params.id) }).first();
    res.json(type);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update payment method type' });
  }
});

// Delete a payment method type
router.delete('/:id', jwtMiddleware, async (req, res) => {
  try {
    const deleted = await db('payment_method_type').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Payment method type not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete payment method type' });
  }
});

export default router;
