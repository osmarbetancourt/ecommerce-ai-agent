import { Router } from 'express';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

router.get('/', async (req, res) => {
  try {
    const carts = await db('cart').select('*');
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch carts' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const cart = await db('cart').where({ id: Number(req.params.id) }).first();
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    const items = await db('cart_item').where({ cart_id: req.params.id });
    res.json({ ...cart, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

router.post('/', async (req, res) => {
  try {
    const inserted: any = await db('cart').insert(req.body).returning('id');
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
    const newCart = await db('cart').where({ id: Number(id) }).first();
    res.status(201).json(newCart);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create cart' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await db('cart').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Cart not found' });
    const cart = await db('cart').where({ id: Number(req.params.id) }).first();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update cart' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('cart').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Cart not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete cart' });
  }
});

export default router;
