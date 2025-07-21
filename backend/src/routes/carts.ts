import { Router } from 'express';
import { jwtMiddleware } from '../middleware/auth';
import { apiRateLimiter, validateCartItem } from '../middleware/security';
import { db } from '../index';

const router = Router();
// Get or create the current user's cart
router.get('/me', jwtMiddleware, apiRateLimiter, async (req, res) => {
  // For now, mock user_id (replace with JWT extraction later)
  const user_id = (req as any).user.id;
  try {
    let cart = await db('cart').where({ user_id }).first();
    if (!cart) {
      const inserted = await db('cart').insert({ user_id }).returning('id');
      let id;
      if (Array.isArray(inserted)) {
        if (typeof inserted[0] === 'object' && inserted[0] !== null && 'id' in inserted[0]) {
          id = inserted[0].id;
        } else {
          id = inserted[0];
        }
      } else {
        id = inserted;
      }
      cart = await db('cart').where({ id: Number(id) }).first();
    }
    const items = await db('cart_item').where({ cart_id: cart.id });
    res.json({ ...cart, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch or create cart' });
  }
});

router.get('/', jwtMiddleware, apiRateLimiter, async (req, res) => {
  try {
    const carts = await db('cart').select('*');
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch carts' });
  }
});

router.get('/:id', jwtMiddleware, apiRateLimiter, async (req, res) => {
  try {
    const cart = await db('cart').where({ id: Number(req.params.id) }).first();
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    const items = await db('cart_item').where({ cart_id: req.params.id });
    res.json({ ...cart, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

router.post('/', jwtMiddleware, apiRateLimiter, async (req, res) => {
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

router.put('/:id', jwtMiddleware, apiRateLimiter, async (req, res) => {
  try {
    const updated = await db('cart').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Cart not found' });
    const cart = await db('cart').where({ id: Number(req.params.id) }).first();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update cart' });
  }
});

router.delete('/:id', jwtMiddleware, apiRateLimiter, async (req, res) => {
  try {
    const cart = await db('cart').where({ id: Number(req.params.id) }).first();
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    const userId = (req as any).user.id;
    if (cart.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this cart' });
    }
    const deleted = await db('cart').where({ id: Number(req.params.id) }).del();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete cart' });
  }
});

export default router;
