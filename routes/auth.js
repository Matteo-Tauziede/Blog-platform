// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { ensureGuest } = require('../middleware/auth');

// GET /register
router.get('/register', ensureGuest, (req, res) => {
  res.render('register', { error: null, formData: {} });
});

// POST /register
router.post('/register', ensureGuest, (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).render('register', {
      error: 'All fields are required.',
      formData: { username, email },
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).render('register', {
      error: 'Passwords do not match.',
      formData: { username, email },
    });
  }
  if (password.length < 6) {
    return res.status(400).render('register', {
      error: 'Password must be at least 6 characters.',
      formData: { username, email },
    });
  }
  if (User.findByUsername(username)) {
    return res.status(400).render('register', {
      error: 'That username is already taken.',
      formData: { username, email },
    });
  }
  if (User.findByEmail(email)) {
    return res.status(400).render('register', {
      error: 'That email is already registered.',
      formData: { username, email },
    });
  }

  const user = User.create({ username, email, password });
  req.session.userId = user.id;
  res.redirect('/');
});

// GET /login
router.get('/login', ensureGuest, (req, res) => {
  res.render('login', { error: null, formData: {} });
});

// POST /login
router.post('/login', ensureGuest, (req, res) => {
  const { username, password } = req.body;
  const user = User.findByUsername(username);

  if (!user || !User.verifyPassword(user, password)) {
    return res.status(400).render('login', {
      error: 'Invalid username or password.',
      formData: { username },
    });
  }

  req.session.userId = user.id;
  const returnTo = req.session.returnTo;
  delete req.session.returnTo;
  res.redirect(returnTo || '/');
});

// POST /logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
