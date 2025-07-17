import { Router } from 'express';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

// Get all messages
router.get('/', async (req, res) => {
  try {
    const messages = await db('message').select('*');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get all messages for a specific conversation
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const messages = await db('message').where({ conversation_id: req.params.conversationId });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages for conversation' });
  }
});

// Get a single message by ID
router.get('/:id', async (req, res) => {
  try {
    const message = await db('message').where({ id: Number(req.params.id) }).first();
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

// Send a new message
router.post('/', async (req, res) => {
  try {
    const inserted = await db('message').insert(req.body).returning('id');
    let id = Array.isArray(inserted) ? (inserted[0]?.id ?? inserted[0]) : inserted;
    const newMessage = await db('message').where({ id }).first();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ error: 'Failed to send message' });
  }
});

// Update a message
router.put('/:id', async (req, res) => {
  try {
    const updated = await db('message').where({ id: Number(req.params.id) }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Message not found' });
    const message = await db('message').where({ id: Number(req.params.id) }).first();
    res.json(message);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update message' });
  }
});

// Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('message').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Message not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete message' });
  }
});

export default router;
