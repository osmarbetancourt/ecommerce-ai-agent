import { Router } from 'express';
import { jwtMiddleware } from '../middleware/auth';
import { apiRateLimiter, validateCartItem } from '../middleware/security';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

// Get all cart items
// Public GET: No rate limit for now, but can be added if needed
import { Request, Response } from 'express';

// Only allow authenticated users to see their own cart items
router.get('/', jwtMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    // Find all cart items for carts owned by this user
    const items = await db('cart_item')
      .join('cart', 'cart_item.cart_id', 'cart.id')
      .where('cart.user_id', userId)
      .select('cart_item.*');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

// Get all items for a specific cart
// Public GET: No rate limit for now
router.get('/cart/:cartId', jwtMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    // Check that the cart belongs to the user
    const cart = await db('cart').where({ id: req.params.cartId, user_id: userId }).first();
    if (!cart) {
      return res.status(403).json({ error: 'Forbidden: Cart does not belong to user' });
    }
    const items = await db('cart_item').where({ cart_id: req.params.cartId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart items for cart' });
  }
});

// Get a single cart item by ID
// Public GET: No rate limit for now
router.get('/:id', jwtMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    // Find the cart item and check ownership
    const item = await db('cart_item')
      .join('cart', 'cart_item.cart_id', 'cart.id')
      .where('cart_item.id', Number(req.params.id))
      .where('cart.user_id', userId)
      .select('cart_item.*')
      .first();
    if (!item) return res.status(404).json({ error: 'Cart item not found or not owned by user' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart item' });
  }
});

// Add a new item to a cart
router.post('/', jwtMiddleware, apiRateLimiter, validateCartItem, async (req: Request, res: Response) => {
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
router.put('/:id', jwtMiddleware, apiRateLimiter, async (req: Request, res: Response) => {
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
router.delete('/:id', jwtMiddleware, apiRateLimiter, async (req: Request, res: Response) => {
  try {
    // Find the cart item and its cart
    const cartItem = await db('cart_item').where({ id: Number(req.params.id) }).first();
    if (!cartItem) return res.status(404).json({ error: 'Cart item not found' });
    const cart = await db('cart').where({ id: cartItem.cart_id }).first();
    if (!cart) return res.status(404).json({ error: 'Cart not found for this item' });
    const userId = (req as any).user.id;
    if (cart.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this cart item' });
    }
    await db('cart_item').where({ id: Number(req.params.id) }).del();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete cart item' });
  }
});

export default router;
