import { Router } from 'express';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

// Get all cart items
router.get('/', async (req, res) => {
  try {
    const items = await db('cart_item').select('*');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

// Get all items for a specific cart
router.get('/cart/:cartId', async (req, res) => {
  try {
    const items = await db('cart_item').where({ cart_id: req.params.cartId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart items for cart' });
  }
});

// Get a single cart item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await db('cart_item').where({ id: Number(req.params.id) }).first();
    if (!item) return res.status(404).json({ error: 'Cart item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart item' });
  }
});

// Add a new item to a cart
router.post('/', async (req, res) => {
  try {
    const { cart_id, product_id, quantity } = req.body;
    if (!cart_id || !product_id || !quantity) {
      return res.status(400).json({ error: 'cart_id, product_id, and quantity are required' });
    }
    // Validate cart exists
    const cart = await db('cart').where({ id: cart_id }).first();
    if (!cart) {
      return res.status(400).json({ error: 'Cart does not exist' });
    }
    // Optionally, validate product exists
    // const product = await db('product').where({ id: product_id }).first();
    // if (!product) {
    //   return res.status(400).json({ error: 'Product does not exist' });
    // }
    const inserted = await db('cart_item').insert(req.body).returning('id');
    let id = Array.isArray(inserted) ? (inserted[0]?.id ?? inserted[0]) : inserted;
    const newItem = await db('cart_item').where({ id }).first();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add cart item' });
  }
});

// Update a cart item
router.put('/:id', async (req, res) => {
  try {
    const updated = await db('cart_item').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Cart item not found' });
    const item = await db('cart_item').where({ id: Number(req.params.id) }).first();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update cart item' });
  }
});

// Remove a cart item
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('cart_item').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Cart item not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete cart item' });
  }
});

export default router;
