// models/comment.js
const { v4: uuidv4 } = require('uuid');
const { readDb, writeDb } = require('./db');

const Comment = {
  getByPostId(postId) {
    const db = readDb();
    return db.comments
      .filter((c) => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  getById(id) {
    const db = readDb();
    return db.comments.find((c) => c.id === id);
  },

  create({ postId, authorId, authorName, content }) {
    const db = readDb();
    const comment = {
      id: uuidv4(),
      postId,
      authorId,
      authorName,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    db.comments.push(comment);
    writeDb(db);
    return comment;
  },

  update(id, content) {
    const db = readDb();
    const comment = db.comments.find((c) => c.id === id);
    if (!comment) return null;
    comment.content = content.trim();
    comment.updatedAt = new Date().toISOString();
    writeDb(db);
    return comment;
  },

  delete(id) {
    const db = readDb();
    const before = db.comments.length;
    db.comments = db.comments.filter((c) => c.id !== id);
    writeDb(db);
    return db.comments.length < before;
  },
};

module.exports = Comment;
