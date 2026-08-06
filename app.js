// app.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');

const { attachUser } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing & method override (lets HTML forms send PUT/DELETE)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Sessions (in-memory store; fine for a demo, swap for a real store in production)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'blog-platform-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Make the current user available in every view
app.use(attachUser);

// Routes
app.use('/', authRoutes);
app.use('/', postRoutes);
app.use('/', commentRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Blog platform running at http://localhost:${PORT}`);
});
