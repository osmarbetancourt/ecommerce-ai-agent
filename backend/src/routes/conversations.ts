import { Router } from 'express';
import { jwtMiddleware } from '../middleware/auth';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

// Get all conversations (admin only, or for debugging)
router.get('/', jwtMiddleware, async (req, res) => {
  try {
    const conversations = await db('conversation').select('*');
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get a single conversation by ID (must be owner or admin)
router.get('/:id', jwtMiddleware, async (req, res) => {
  // Only allow user to fetch their own conversation (or admin)
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const conversation = await db('conversation').where({ id: Number(req.params.id) }).first();
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  if (!isAdmin && conversation.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(conversation);
  try {
    const conversation = await db('conversation').where({ id: Number(req.params.id) }).first();
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Create a new conversation (only if user doesn't have one)
router.post('/', jwtMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    // Check if user already has a conversation
    const existing = await db('conversation').where({ user_id: userId }).first();
    if (existing) {
      return res.status(409).json({ error: 'User already has a conversation', conversation: existing });
    }
    // Only allow user_id from JWT
    const inserted = await db('conversation').insert({ user_id: userId }).returning('id');
    let id = Array.isArray(inserted) ? (inserted[0]?.id ?? inserted[0]) : inserted;
    const newConversation = await db('conversation').where({ id }).first();
    res.status(201).json(newConversation);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create conversation' });
  }
});

// Update a conversation (only owner or admin)
router.put('/:id', jwtMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const isAdmin = (req as any).user?.role === 'admin';
    const conversation = await db('conversation').where({ id: Number(req.params.id) }).first();
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (!isAdmin && conversation.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const updated = await db('conversation').where({ id: Number(req.params.id) }).update(req.body);
    const updatedConversation = await db('conversation').where({ id: Number(req.params.id) }).first();
    res.json(updatedConversation);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update conversation' });
  }
});

// Delete a conversation (only owner or admin)
router.delete('/:id', jwtMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const isAdmin = (req as any).user?.role === 'admin';
    const conversation = await db('conversation').where({ id: Number(req.params.id) }).first();
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (!isAdmin && conversation.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const deleted = await db('conversation').where({ id: Number(req.params.id) }).del();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete conversation' });
  }
});

export default router;
