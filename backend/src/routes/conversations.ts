import { Router } from 'express';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

// Get all conversations
router.get('/', async (req, res) => {
  try {
    const conversations = await db('conversation').select('*');
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get a single conversation by ID
router.get('/:id', async (req, res) => {
  try {
    const conversation = await db('conversation').where({ id: Number(req.params.id) }).first();
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Create a new conversation
router.post('/', async (req, res) => {
  try {
    const inserted = await db('conversation').insert(req.body).returning('id');
    let id = Array.isArray(inserted) ? (inserted[0]?.id ?? inserted[0]) : inserted;
    const newConversation = await db('conversation').where({ id }).first();
    res.status(201).json(newConversation);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create conversation' });
  }
});

// Update a conversation
router.put('/:id', async (req, res) => {
  try {
    const updated = await db('conversation').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Conversation not found' });
    const conversation = await db('conversation').where({ id: Number(req.params.id) }).first();
    res.json(conversation);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update conversation' });
  }
});

// Delete a conversation
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('conversation').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete conversation' });
  }
});

export default router;
