import { Router } from 'express';
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

router.get('/', async (req, res) => {
  try {
    const orders = await db('order').select('*');
    res.json(orders.map(normalizeOrder));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await db('order').where({ id: Number(req.params.id) }).first();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = await db('order_item').where({ order_id: req.params.id });
    res.json({ ...normalizeOrder(order), items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.post('/', async (req, res) => {
  try {
    const inserted = await db('order').insert(req.body).returning('id');
    let id = Array.isArray(inserted) ? (inserted[0]?.id ?? inserted[0]) : inserted;
    const newOrder = await db('order').where({ id }).first();
    res.status(201).json(normalizeOrder(newOrder));
  } catch (err) {
    res.status(400).json({ error: 'Failed to create order' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await db('order').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    const order = await db('order').where({ id: Number(req.params.id) }).first();
    res.json(normalizeOrder(order));
  } catch (err) {
    res.status(400).json({ error: 'Failed to update order' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('order').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete order' });
  }
});

export default router;
