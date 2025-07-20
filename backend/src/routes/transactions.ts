import { Router } from 'express';
import { jwtMiddleware } from '../middleware/auth';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

// List all transactions
// List all transactions (admin only)
router.get('/', jwtMiddleware, async (req, res) => {
  const isAdmin = (req as any).user?.role === 'admin';
  if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
  try {
    const transactions = await db('transaction').select('*');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transactions by user id
// Get transactions by user id (owner or admin)
router.get('/user/:userId', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  if (!isAdmin && req.params.userId !== String(userId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const transactions = await db('transaction').where({ user_id: req.params.userId });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions for user' });
  }
});

// Get transactions by order id
// Get transactions by order id (owner or admin)
router.get('/order/:orderId', jwtMiddleware, async (req, res) => {
  // Fetch the order to check ownership
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const order = await db('order').where({ id: req.params.orderId }).first();
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!isAdmin && order.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const transactions = await db('transaction').where({ order_id: req.params.orderId });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions for order' });
  }
});

// Get a single transaction by id
// Get a single transaction by id (owner or admin)
router.get('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const transaction = await db('transaction').where({ id: Number(req.params.id) }).first();
  if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
  if (!isAdmin && transaction.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(transaction);
});

// Create a transaction (initiate payment)
// Create a transaction (authenticated user only)
router.post('/', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  try {
    const inserted: any = await db('transaction').insert({ ...req.body, user_id: userId }).returning('id');
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
    const newTransaction = await db('transaction').where({ id: Number(id) }).first();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create transaction' });
  }
});

// Update a transaction (e.g., update status)
// Update a transaction (owner or admin)
router.put('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const transaction = await db('transaction').where({ id: Number(req.params.id) }).first();
  if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
  if (!isAdmin && transaction.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const updated = await db('transaction').where({ id: Number(req.params.id) }).update(req.body);
    const updatedTransaction = await db('transaction').where({ id: Number(req.params.id) }).first();
    res.json(updatedTransaction);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update transaction' });
  }
});

// Delete a transaction
// Delete a transaction (owner or admin)
router.delete('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const transaction = await db('transaction').where({ id: Number(req.params.id) }).first();
  if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
  if (!isAdmin && transaction.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const deleted = await db('transaction').where({ id: Number(req.params.id) }).del();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete transaction' });
  }
});

export default router;
