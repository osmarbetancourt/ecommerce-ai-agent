import { Router } from 'express';
import { jwtMiddleware } from '../middleware/auth';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

function normalizeOrder(order: any) {
  if (order && typeof order.total_price === 'string') {
    return { ...order, total_price: Number(order.total_price) };
  }
  return order;
}

const router = Router();

// List all orders (admin only)
router.get('/', jwtMiddleware, async (req, res) => {
  const isAdmin = (req as any).user?.role === 'admin';
  if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
  try {
    const orders = await db('order').select('*');
    res.json(orders.map(normalizeOrder));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get a single order by id (owner or admin)
router.get('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  try {
    const order = await db('order').where({ id: Number(req.params.id) }).first();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!isAdmin && order.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const items = await db('order_item').where({ order_id: req.params.id });
    res.json({ ...normalizeOrder(order), items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create an order (authenticated user only)
router.post('/', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  try {
    const inserted = await db('order').insert({ ...req.body, user_id: userId }).returning('id');
    let id = Array.isArray(inserted) ? (inserted[0]?.id ?? inserted[0]) : inserted;
    const newOrder = await db('order').where({ id }).first();
    res.status(201).json(normalizeOrder(newOrder));
  } catch (err) {
    res.status(400).json({ error: 'Failed to create order' });
  }
});

// Update an order (owner or admin)
router.put('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const order = await db('order').where({ id: Number(req.params.id) }).first();
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!isAdmin && order.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const updated = await db('order').where({ id: Number(req.params.id) }).update(req.body);
    const updatedOrder = await db('order').where({ id: Number(req.params.id) }).first();
    res.json(normalizeOrder(updatedOrder));
  } catch (err) {
    res.status(400).json({ error: 'Failed to update order' });
  }
});

// Delete an order (owner or admin)
router.delete('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const order = await db('order').where({ id: Number(req.params.id) }).first();
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!isAdmin && order.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const deleted = await db('order').where({ id: Number(req.params.id) }).del();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete order' });
  }
});

export default router;
