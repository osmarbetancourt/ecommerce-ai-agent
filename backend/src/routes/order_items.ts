import { Router } from 'express';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

// List all order items
router.get('/', async (req, res) => {
  try {
    const items = await db('order_item').select('*');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
});

// Get order items by order id
router.get('/order/:orderId', async (req, res) => {
  try {
    const items = await db('order_item').where({ order_id: req.params.orderId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order items for order' });
  }
});

// Get a single order item by id
router.get('/:id', async (req, res) => {
  try {
    const item = await db('order_item').where({ id: Number(req.params.id) }).first();
    if (!item) return res.status(404).json({ error: 'Order item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order item' });
  }
});

// Add an item to an order
router.post('/', async (req, res) => {
  try {
    const inserted: any = await db('order_item').insert(req.body).returning('id');
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
router.put('/:id', async (req, res) => {
  try {
    const updated = await db('order_item').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Order item not found' });
    const item = await db('order_item').where({ id: Number(req.params.id) }).first();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update order item' });
  }
});

// Remove an item from an order
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('order_item').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Order item not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete order item' });
  }
});

export default router;
