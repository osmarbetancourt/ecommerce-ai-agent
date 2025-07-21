import { Router } from 'express';
import { jwtMiddleware } from '../middleware/auth';
import { db } from '../index';

const router = Router();

// List all payment methods
// List all payment methods (admin only)
router.get('/', jwtMiddleware, async (req, res) => {
  const isAdmin = (req as any).user?.role === 'admin';
  if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
  try {
    const methods = await db('payment_method').select('*');
    res.json(methods);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// Get payment methods by user id
// Get payment methods by user id (owner or admin)
router.get('/user/:userId', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  if (!isAdmin && req.params.userId !== String(userId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const methods = await db('payment_method').where({ user_id: req.params.userId });
    res.json(methods);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment methods for user' });
  }
});

// Get a single payment method by id
// Get a single payment method by id (owner or admin)
router.get('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const method = await db('payment_method').where({ id: Number(req.params.id) }).first();
  if (!method) return res.status(404).json({ error: 'Payment method not found' });
  if (!isAdmin && method.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(method);
});

// Add a payment method
// Add a payment method (authenticated user only)
router.post('/', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  try {
    const inserted: any = await db('payment_method').insert({ ...req.body, user_id: userId }).returning('id');
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
// Update a payment method (owner or admin)
router.put('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const method = await db('payment_method').where({ id: Number(req.params.id) }).first();
  if (!method) return res.status(404).json({ error: 'Payment method not found' });
  if (!isAdmin && method.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const updated = await db('payment_method').where({ id: Number(req.params.id) }).update(req.body);
    const updatedMethod = await db('payment_method').where({ id: Number(req.params.id) }).first();
    res.json(updatedMethod);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update payment method' });
  }
});

// Delete a payment method
// Delete a payment method (owner or admin)
router.delete('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const method = await db('payment_method').where({ id: Number(req.params.id) }).first();
  if (!method) return res.status(404).json({ error: 'Payment method not found' });
  if (!isAdmin && method.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const deleted = await db('payment_method').where({ id: Number(req.params.id) }).del();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete payment method' });
  }
});

export default router;
