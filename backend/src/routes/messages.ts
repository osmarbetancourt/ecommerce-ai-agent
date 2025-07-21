import { Router } from 'express';
import { jwtMiddleware } from '../middleware/auth';
import { db } from '../index';

const router = Router();

// Get all messages (admin only)
router.get('/', jwtMiddleware, async (req, res) => {
  const isAdmin = (req as any).user?.role === 'admin';
  if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
  try {
    const messages = await db('message').select('*');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get all messages for a specific conversation (owner or admin)
router.get('/conversation/:conversationId', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  // Fetch the conversation to check ownership
  const conversation = await db('conversation').where({ id: req.params.conversationId }).first();
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  if (!isAdmin && conversation.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const messages = await db('message').where({ conversation_id: req.params.conversationId });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages for conversation' });
  }
});

// Get a single message by ID (owner of conversation or admin)
router.get('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const message = await db('message').where({ id: Number(req.params.id) }).first();
  if (!message) return res.status(404).json({ error: 'Message not found' });
  const conversation = await db('conversation').where({ id: message.conversation_id }).first();
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  if (!isAdmin && conversation.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(message);
});

// Send a new message (owner of conversation or admin)
router.post('/', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const { conversation_id, ...rest } = req.body;
  const conversation = await db('conversation').where({ id: conversation_id }).first();
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  if (!isAdmin && conversation.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const inserted = await db('message').insert({ conversation_id, ...rest }).returning('id');
    let id = Array.isArray(inserted) ? (inserted[0]?.id ?? inserted[0]) : inserted;
    const newMessage = await db('message').where({ id }).first();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ error: 'Failed to send message' });
  }
});

// Update a message (owner of conversation or admin)
router.put('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const message = await db('message').where({ id: Number(req.params.id) }).first();
  if (!message) return res.status(404).json({ error: 'Message not found' });
  const conversation = await db('conversation').where({ id: message.conversation_id }).first();
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  if (!isAdmin && conversation.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const updated = await db('message').where({ id: Number(req.params.id) }).update(req.body);
    const updatedMessage = await db('message').where({ id: Number(req.params.id) }).first();
    res.json(updatedMessage);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update message' });
  }
});

// Delete a message (owner of conversation or admin)
router.delete('/:id', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === 'admin';
  const message = await db('message').where({ id: Number(req.params.id) }).first();
  if (!message) return res.status(404).json({ error: 'Message not found' });
  const conversation = await db('conversation').where({ id: message.conversation_id }).first();
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  if (!isAdmin && conversation.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const deleted = await db('message').where({ id: Number(req.params.id) }).del();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete message' });
  }
});

export default router;
