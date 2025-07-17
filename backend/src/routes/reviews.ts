import { Router } from 'express';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

// List all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await db('review').select('*');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get reviews by product id
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await db('review').where({ product_id: req.params.productId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews for product' });
  }
});

// Get a single review by id
router.get('/:id', async (req, res) => {
  try {
    const review = await db('review').where({ id: Number(req.params.id) }).first();
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Add a review
router.post('/', async (req, res) => {
  try {
    // Ensure 'description' is used, not 'comment'
    const reviewData = { ...req.body };
    if ('comment' in reviewData) {
      reviewData.description = reviewData.comment;
      delete reviewData.comment;
    }
    const inserted: any = await db('review').insert(reviewData).returning('id');
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
    const newReview = await db('review').where({ id: Number(id) }).first();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add review' });
  }
});

// Update a review
router.put('/:id', async (req, res) => {
  try {
    // Ensure 'description' is used, not 'comment'
    const reviewData = { ...req.body };
    if ('comment' in reviewData) {
      reviewData.description = reviewData.comment;
      delete reviewData.comment;
    }
    const updated = await db('review').where({ id: Number(req.params.id) }).update(reviewData);
    if (!updated) return res.status(404).json({ error: 'Review not found' });
    const review = await db('review').where({ id: Number(req.params.id) }).first();
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update review' });
  }
});

// Delete a review
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('review').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete review' });
  }
});

export default router;
