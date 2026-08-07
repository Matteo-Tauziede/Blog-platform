// routes/comments.js
const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Comment = require('../models/comment');
const { ensureAuth } = require('../middleware/auth');

// POST /posts/:postId/comments -> add a comment
router.post('/posts/:postId/comments', ensureAuth, (req, res) => {
  const post = Post.getById(req.params.postId);
  if (!post) return res.status(404).render('404');
  if (!post.isPublic && post.authorId !== req.session.userId) {
    return res.status(403).send('Forbidden: this post is private.');
  }

  const { content } = req.body;
  if (content && content.trim()) {
    Comment.create({
      postId: post.id,
      authorId: req.session.userId,
      authorName: res.locals.currentUser.username,
      content,
    });
  }

  res.redirect(`/posts/${post.id}`);
});

// DELETE /posts/:postId/comments/:id -> remove a comment (author of comment or post owner)
router.delete('/posts/:postId/comments/:id', ensureAuth, (req, res) => {
  const post = Post.getById(req.params.postId);
  const comment = Comment.getById(req.params.id);
  if (!post || !comment) return res.status(404).render('404');

  const isCommentAuthor = comment.authorId === req.session.userId;
  const isPostOwner = post.authorId === req.session.userId;
  if (!isCommentAuthor && !isPostOwner) {
    return res.status(403).send('Forbidden: you cannot delete this comment.');
  }

  Comment.delete(comment.id);
  res.redirect(`/posts/${post.id}`);
});

module.exports = router;
