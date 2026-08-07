// routes/posts.js
const express = require('express');
const router = express.Router();
const { marked } = require('marked');
const Post = require('../models/post');
const Comment = require('../models/comment');
const { ensureAuth } = require('../middleware/auth');

marked.setOptions({ breaks: true }); // treat single newlines as <br>

// Only the author of a post may edit/delete it.
function ensurePostOwner(req, res, next) {
  const post = Post.getById(req.params.id);
  if (!post) return res.status(404).render('404');
  if (!req.session.userId || post.authorId !== req.session.userId) {
    return res.status(403).send('Forbidden: you do not own this post.');
  }
  req.post = post;
  next();
}

// GET / -> index of visible posts, optional ?tag= filter
router.get('/', (req, res) => {
  const viewerId = req.session.userId || null;
  const tag = req.query.tag || '';
  const posts = Post.getVisible(viewerId, tag);
  const allTags = Post.getAllTags();
  res.render('index', { posts, allTags, activeTag: tag });
});

// GET /posts/new -> new post form
router.get('/posts/new', ensureAuth, (req, res) => {
  res.render('new', { error: null, formData: {} });
});

// POST /posts -> create
router.post('/posts', ensureAuth, (req, res) => {
  const { title, content, tags, isPublic } = req.body;

  if (!title || !title.trim() || !content || !content.trim()) {
    return res.status(400).render('new', {
      error: 'Title and content are required.',
      formData: { title, content, tags, isPublic },
    });
  }

  const post = Post.create({
    title,
    content,
    tags,
    isPublic: isPublic === 'on' || isPublic === true,
    authorId: req.session.userId,
    authorName: res.locals.currentUser.username,
  });

  res.redirect(`/posts/${post.id}`);
});

// GET /posts/:id -> show a single post + comments
router.get('/posts/:id', (req, res) => {
  const post = Post.getById(req.params.id);
  if (!post) return res.status(404).render('404');

  const viewerId = req.session.userId || null;
  if (!post.isPublic && post.authorId !== viewerId) {
    return res.status(403).send('Forbidden: this post is private.');
  }

  const comments = Comment.getByPostId(post.id);
  const renderedHtml = marked.parse(post.content || '');

  res.render('show', {
    post,
    renderedHtml,
    comments,
    isOwner: viewerId === post.authorId,
  });
});

// GET /posts/:id/edit -> edit form (owner only)
router.get('/posts/:id/edit', ensureAuth, ensurePostOwner, (req, res) => {
  res.render('edit', { post: req.post, error: null });
});

// PUT /posts/:id -> update (owner only)
router.put('/posts/:id', ensureAuth, ensurePostOwner, (req, res) => {
  const { title, content, tags, isPublic } = req.body;

  if (!title || !title.trim() || !content || !content.trim()) {
    return res.status(400).render('edit', {
      post: { ...req.post, title, content, tags, isPublic },
      error: 'Title and content are required.',
    });
  }

  Post.update(req.params.id, {
    title,
    content,
    tags,
    isPublic: isPublic === 'on' || isPublic === true,
  });

  res.redirect(`/posts/${req.params.id}`);
});

// DELETE /posts/:id -> delete (owner only)
router.delete('/posts/:id', ensureAuth, ensurePostOwner, (req, res) => {
  Post.delete(req.params.id);
  res.redirect('/');
});

module.exports = router;
