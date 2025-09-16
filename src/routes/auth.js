import express from 'express';
import bcrypt from 'bcrypt';
import { body, query, validationResult } from 'express-validator';
import passport from '../passport.js';
import { q } from '../db.js';

const router = express.Router();

router.get('/signup', (req, res) => {
  res.render('sign-up', { errors: [], data: {} });
});

router.post(
  '/signup',
  [
    body('firstName').trim().isLength({ min: 1 }).withMessage('First name required')
      .isAlpha('en-US', { ignore: " -'" }).withMessage('First name must contain only letters'),
    body('lastName').trim().isLength({ min: 1 }).withMessage('Last name required')
      .isAlpha('en-US', { ignore: " -'" }).withMessage('Last name must contain only letters'),
    body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/\d/).withMessage('Password must contain a number'),
    body('confirmPassword').custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords do not match');
      return true;
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const data = {
      firstName: req.body.firstName ?? '',
      lastName: req.body.lastName ?? '',
      email: req.body.email ?? ''
    };

    if (!errors.isEmpty()) {
      return res.status(400).render('signup', { errors: errors.array(), data });
    }

    try {
      const hash = await bcrypt.hash(req.body.password, 12);
      await q(
        `INSERT INTO users (first_name, last_name, email, password_hash)
         VALUES ($1, $2, $3, $4)`,
        [req.body.firstName, req.body.lastName, req.body.email, hash]
      );
      res.redirect('/login?welcome=1');
    } catch (e) {
      // handle duplicate email
      if (e.code === '23505') {
        return res.status(400).render('signup', {
          errors: [{ msg: 'Email already in use' }],
          data
        });
      }
      throw e;
    }
  }
);

router.get('/login', (req, res) => {
  res.render('login', {query: req.query});
});

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 1 }).withMessage('Password required')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('login', { error: errors.array()[0].msg });
    }
    next();
  },
  passport.authenticate('local', {
    failureRedirect: '/login?error=1',
    successRedirect: '/'
  })
);

router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

router.get('/join', (req, res) => {
  res.render('join', { error: null });
});

router.post('/join', (req, res) => {
  const { passcode } = req.body;
  if (!req.isAuthenticated()) return res.redirect('/login');

  if (passcode === process.env.MEMBER_PASSCODE) {
    q('UPDATE users SET is_member=true WHERE id=$1', [req.user.id])
      .then(() => res.redirect('/?joined=1'));
  } else {
    res.status(400).render('join', { error: 'Incorrect passcode' });
  }
});

router.get('/admin', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.render('admin', { error: null });
});

router.post('/admin', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  const { passcode } = req.body;

  if (passcode === process.env.ADMIN_PASSCODE) {
    q('UPDATE users SET is_admin=true WHERE id=$1', [req.user.id])
      .then(() => res.redirect('/?admin=1'));
  } else {
    res.status(400).render('admin', { error: 'Incorrect admin passcode' });
  }
});

export default router;
