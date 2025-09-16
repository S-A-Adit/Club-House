import express from 'express';
import { body, validationResult } from 'express-validator';
import { ensureAuth, ensureAdmin } from '../middleware/auth.js';
import { q } from '../db.js';

const router = express.Router();

router.get('/messages/new', ensureAuth, (req, res) => {
  res.render('new-message', { errors: [], data: {} });
});

router.post(
  '/messages/new',
  ensureAuth,
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Title required').isLength({ max: 200 }).withMessage('Title too long'),
    body('body').trim().isLength({ min: 1 }).withMessage('Message text required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const data = { title: req.body.title ?? '', body: req.body.body ?? '' };
    if (!errors.isEmpty()) {
      return res.status(400).render('new-message', { errors: errors.array(), data });
    }
    await q(
      'INSERT INTO messages (user_id, title, body) VALUES ($1, $2, $3)',
      [req.user.id, req.body.title, req.body.body]
    );
    res.redirect('/');
  }
);

router.delete('/messages/:id', ensureAdmin, async (req, res) => {
  await q('DELETE FROM messages WHERE id=$1', [req.params.id]);
  res.redirect('/?deleted=1');
});

export default router;
