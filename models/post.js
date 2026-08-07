// models/post.js
const { v4: uuidv4 } = require('uuid');
const { readDb, writeDb } = require('./db');

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags
      .map((t) => String(t).trim().toLowerCase())
      .filter(Boolean)
      .filter((t, i, arr) => arr.indexOf(t) === i);
  }
  return String(tags || '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .filter((t, i, arr) => arr.indexOf(t) === i);
}

const Post = {
  // Returns every post, newest first.
  getAll() {
    const db = readDb();
    return db.posts.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Returns posts visible to a given viewer:
  // - all public posts
  // - plus the viewer's own private posts (if logged in)
  // Optionally filtered by tag.
  getVisible(viewerId, tag) {
    let posts = this.getAll();
    if (tag) {
      const t = String(tag).trim().toLowerCase();
      posts = posts.filter((p) => p.tags.includes(t));
    }
    return posts.filter((p) => p.isPublic || p.authorId === viewerId);
  },

  getById(id) {
    const db = readDb();
    return db.posts.find((p) => p.id === id);
  },

  create({ title, content, tags, isPublic, authorId, authorName }) {
    const db = readDb();
    const now = new Date().toISOString();
    const post = {
      id: uuidv4(),
      title: title.trim(),
      content, // markdown source
      tags: normalizeTags(tags),
      isPublic: Boolean(isPublic),
      authorId,
      authorName,
      createdAt: now,
      updatedAt: now,
    };
    db.posts.push(post);
    writeDb(db);
    return post;
  },

  update(id, { title, content, tags, isPublic }) {
    const db = readDb();
    const post = db.posts.find((p) => p.id === id);
    if (!post) return null;
    post.title = title.trim();
    post.content = content;
    post.tags = normalizeTags(tags);
    post.isPublic = Boolean(isPublic);
    post.updatedAt = new Date().toISOString();
    writeDb(db);
    return post;
  },

  delete(id) {
    const db = readDb();
    const before = db.posts.length;
    db.posts = db.posts.filter((p) => p.id !== id);
    // Cascade delete comments belonging to this post.
    db.comments = db.comments.filter((c) => c.postId !== id);
    writeDb(db);
    return db.posts.length < before;
  },

  // All distinct tags across every post (used for a tag cloud / filter list).
  getAllTags() {
    const db = readDb();
    const tagSet = new Set();
    db.posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  },
};

module.exports = Post;
