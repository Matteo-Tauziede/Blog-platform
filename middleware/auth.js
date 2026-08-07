// middleware/auth.js
const User = require('../models/user');

// Makes the logged-in user (if any) available to every view as `currentUser`.
function attachUser(req, res, next) {
  if (req.session && req.session.userId) {
    const user = User.findById(req.session.userId);
    res.locals.currentUser = User.toSafe(user);
  } else {
    res.locals.currentUser = null;
  }
  next();
}

// Blocks a route unless the visitor is logged in.
function ensureAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}

// Redirects logged-in users away from login/register pages.
function ensureGuest(req, res, next) {
  if (req.session && req.session.userId) return res.redirect('/');
  next();
}

module.exports = { attachUser, ensureAuth, ensureGuest };
