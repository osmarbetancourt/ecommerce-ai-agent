import { Router } from 'express';
import { jwtMiddleware } from '../middleware/auth';
import knex from 'knex';
import config from '../../knexfile';
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

const router = Router();

// List all notifications
router.get('/', jwtMiddleware, async (req, res) => {
  try {
    const notifications = await db('notification').select('*');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get a single notification by id
router.get('/:id', jwtMiddleware, async (req, res) => {
  try {
    const notification = await db('notification').where({ id: Number(req.params.id) }).first();
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
});

// Create a notification
router.post('/', jwtMiddleware, async (req, res) => {
  try {
    // Ensure 'content' is used, not 'comment'
    const notificationData = { ...req.body };
    if ('comment' in notificationData) {
      notificationData.content = notificationData.comment;
      delete notificationData.comment;
    }
    const inserted: any = await db('notification').insert(notificationData).returning('id');
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
    const newNotification = await db('notification').where({ id: Number(id) }).first();
    res.status(201).json(newNotification);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create notification' });
  }
});

// Mark as read/unread (update)
router.put('/:id', jwtMiddleware, async (req, res) => {
  try {
    // Ensure 'content' is used, not 'comment'
    const notificationData = { ...req.body };
    if ('comment' in notificationData) {
      notificationData.content = notificationData.comment;
      delete notificationData.comment;
    }
    const updated = await db('notification').where({ id: Number(req.params.id) }).update(notificationData);
    if (!updated) return res.status(404).json({ error: 'Notification not found' });
    const notification = await db('notification').where({ id: Number(req.params.id) }).first();
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update notification' });
  }
});

// Delete a notification
router.delete('/:id', jwtMiddleware, async (req, res) => {
  try {
    const deleted = await db('notification').where({ id: Number(req.params.id) }).del();
    if (!deleted) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete notification' });
  }
});

export default router;
