import express from 'express';
import dayjs from 'dayjs';
import { q } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  // Fetch messages with author
  const { rows: messages } = await q(
    `SELECT m.id, m.title, m.body, m.created_at,
            u.first_name, u.last_name
     FROM messages m
     LEFT JOIN users u ON m.user_id = u.id
     ORDER BY m.created_at DESC`
  );

  const user = req.user || null;
  const canSeeMeta = user && (user.is_member || user.is_admin);

  res.render('index', {
    messages,
    canSeeMeta,
    dayjs
  });
});

export default router;
