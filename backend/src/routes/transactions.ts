import { Router } from 'express';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

// List all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await db('transaction').select('*');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transactions by user id
router.get('/user/:userId', async (req, res) => {
  try {
    const transactions = await db('transaction').where({ user_id: req.params.userId });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions for user' });
  }
});

// Get transactions by order id
router.get('/order/:orderId', async (req, res) => {
  try {
    const transactions = await db('transaction').where({ order_id: req.params.orderId });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions for order' });
  }
});

// Get a single transaction by id
router.get('/:id', async (req, res) => {
  try {
    const transaction = await db('transaction').where({ id: Number(req.params.id) }).first();
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create a transaction (initiate payment)
router.post('/', async (req, res) => {
  try {
    const inserted: any = await db('transaction').insert(req.body).returning('id');
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
    const newTransaction = await db('transaction').where({ id: Number(id) }).first();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create transaction' });
  }
});

// Update a transaction (e.g., update status)
router.put('/:id', async (req, res) => {
  try {
    const updated = await db('transaction').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Transaction not found' });
    const transaction = await db('transaction').where({ id: Number(req.params.id) }).first();
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update transaction' });
  }
});

// Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('transaction').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete transaction' });
  }
});

export default router;
