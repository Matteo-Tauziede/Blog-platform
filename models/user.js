// models/user.js
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { readDb, writeDb } = require('./db');

const User = {
  findByUsername(username) {
    const db = readDb();
    return db.users.find(
      (u) => u.username.toLowerCase() === String(username || '').toLowerCase()
    );
  },

  findByEmail(email) {
    const db = readDb();
    return db.users.find(
      (u) => u.email.toLowerCase() === String(email || '').toLowerCase()
    );
  },

  findById(id) {
    const db = readDb();
    return db.users.find((u) => u.id === id);
  },

  create({ username, email, password }) {
    const db = readDb();
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = {
      id: uuidv4(),
      username: username.trim(),
      email: email.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    writeDb(db);
    return user;
  },

  verifyPassword(user, password) {
    if (!user) return false;
    return bcrypt.compareSync(password, user.passwordHash);
  },

  // Returns a "safe" version of the user without the password hash.
  toSafe(user) {
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  },
};

module.exports = User;
