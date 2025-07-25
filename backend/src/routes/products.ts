import { Router } from 'express';
import { jwtMiddleware, requireAdmin } from '../middleware/auth';
import { db } from '../index';

function normalizeProduct(product: any) {
  if (product && typeof product.price === 'string') {
    return { ...product, price: Number(product.price) };
  }
  return product;
}

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = db('product').select('product.*');

    // If category filter is present, join with category table and filter by name
    if (category && typeof category === 'string' && category.trim() !== '') {
      query = query
        .join('category', 'product.category_id', 'category.id')
        .whereRaw('LOWER(category.name) = ?', [category.trim().toLowerCase()]);
    }

    // If search filter is present, filter by name or description
    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      query = query.where(function() {
        this.whereRaw('LOWER(product.name) LIKE ?', [term])
          .orWhereRaw('LOWER(product.description) LIKE ?', [term]);
      });
    }

    const products = await query;
    res.json(products.map(normalizeProduct));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await db('product').where({ id: Number(req.params.id) }).first();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(normalizeProduct(product));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create a product (admin only)
router.post('/', jwtMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, price, category_id } = req.body;
    if (!name || price === undefined || category_id === undefined) {
      return res.status(400).json({ error: 'name, price, and category_id are required' });
    }
    const inserted = await db('product').insert(req.body).returning('id');
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
    const newProduct = await db('product').where({ id }).first();
    res.status(201).json(normalizeProduct(newProduct));
  } catch (err: any) {
    // Improved error handling: log and return DB error message if available
    console.error('Product creation error:', err);
    if (err && err.code === '23503') { // PostgreSQL foreign key violation
      return res.status(400).json({ error: 'Invalid category_id (foreign key violation)' });
    }
    res.status(400).json({ error: err?.message || 'Failed to create product' });
  }
});

// Update a product (admin only)
router.put('/:id', jwtMiddleware, requireAdmin, async (req, res) => {
  try {
    const updated = await db('product').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    const product = await db('product').where({ id: Number(req.params.id) }).first();
    res.json(normalizeProduct(product));
  } catch (err) {
    res.status(400).json({ error: 'Failed to update product' });
  }
});

// Delete a product (admin only)
router.delete('/:id', jwtMiddleware, requireAdmin, async (req, res) => {
  try {
    const deleted = await db('product').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete product' });
  }
});

export default router;
