import { Router } from 'express';
import { jwtMiddleware } from '../middleware/auth';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

// List all order items
// List all order items (admin only)
router.get('/', jwtMiddleware, async (req, res) => {
  const isAdmin = (req as any).user?.role === 'admin';
  if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
  try {
    const items = await db('order_item').select('*');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
});

// Get order items by order id
// Get order items by order id (owner or admin)
router.get('/order/:orderId', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const order = await db('order').where({ id: req.params.orderId }).first();
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!isAdmin && order.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const items = await db('order_item').where({ order_id: req.params.orderId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order items for order' });
  }
});

// Get a single order item by id
// Get a single order item by id (owner or admin)
router.get('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const item = await db('order_item').where({ id: Number(req.params.id) }).first();
  if (!item) return res.status(404).json({ error: 'Order item not found' });
  const order = await db('order').where({ id: item.order_id }).first();
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!isAdmin && order.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(item);
});

// Add an item to an order
// Add an item to an order (owner or admin)
router.post('/', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const { order_id, ...rest } = req.body;
  const order = await db('order').where({ id: order_id }).first();
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!isAdmin && order.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const inserted: any = await db('order_item').insert({ order_id, ...rest }).returning('id');
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
    const newItem = await db('order_item').where({ id: Number(id) }).first();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add order item' });
  }
});

// Update an order item
// Update an order item (owner or admin)
router.put('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const item = await db('order_item').where({ id: Number(req.params.id) }).first();
  if (!item) return res.status(404).json({ error: 'Order item not found' });
  const order = await db('order').where({ id: item.order_id }).first();
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!isAdmin && order.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const updated = await db('order_item').where({ id: Number(req.params.id) }).update(req.body);
    const updatedItem = await db('order_item').where({ id: Number(req.params.id) }).first();
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update order item' });
  }
});

// Remove an item from an order
// Remove an item from an order (owner or admin)
router.delete('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const item = await db('order_item').where({ id: Number(req.params.id) }).first();
  if (!item) return res.status(404).json({ error: 'Order item not found' });
  const order = await db('order').where({ id: item.order_id }).first();
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!isAdmin && order.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const deleted = await db('order_item').where({ id: Number(req.params.id) }).del();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete order item' });
  }
});

export default router;
