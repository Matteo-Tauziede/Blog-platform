# Blog Platform

A simple full-stack blogging platform built with **Node.js**, **Express**, and **EJS**.

## Features

- **User registration & authentication** — bcrypt-hashed passwords, cookie sessions
- **Full CRUD for posts** — create, read, update, delete
- **Full CRUD for comments** — create, read, delete (edit-friendly model included)
- **Markdown editor** — write posts in Markdown with a live Write/Preview toggle, rendered server-side with `marked`
- **Tagging system** — comma-separated tags, tag cloud filter on the home page
- **Public/private posts** — private posts are visible only to their author

## Tech stack

- Node.js + Express
- EJS templates (server-rendered, no frontend framework needed)
- `express-session` for auth sessions
- `bcryptjs` for password hashing
- `marked` for Markdown → HTML rendering
- `method-override` so plain HTML forms can send PUT/DELETE
- A simple JSON file (`data/db.json`) as the data store — no database server to install or configure

## Project structure

```
blog-platform/
├── public/
│   ├── css/style.css        # all styling
│   └── js/editor.js         # live markdown preview + delete confirmations
├── views/
│   ├── partials/header.ejs, footer.ejs
│   ├── index.ejs            # post list + tag filter
│   ├── new.ejs               # create post (markdown editor)
│   ├── edit.ejs               # edit post (markdown editor)
│   ├── show.ejs               # post detail + comments
│   ├── login.ejs / register.ejs
│   └── 404.ejs
├── models/
│   ├── db.js                # tiny JSON file "database" helper
│   ├── user.js
│   ├── post.js
│   └── comment.js
├── routes/
│   ├── auth.js               # register / login / logout
│   ├── posts.js               # post CRUD + tag filtering + visibility rules
│   └── comments.js            # comment create/delete
├── middleware/
│   └── auth.js               # ensureAuth, ensureGuest, attachUser
├── data/
│   └── db.json               # auto-created data store
├── app.js
└── package.json
```

## Getting started

```bash
cd blog-platform
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

For auto-restart during development:

```bash
npm run dev
```

## How it works

- **Auth**: Passwords are hashed with bcrypt before being stored. On login, a session cookie (`connect.sid`) is set; `middleware/auth.js` reads it on every request to attach `currentUser` to all views.
- **Posts**: Stored with `title`, `content` (raw Markdown), `tags`, `isPublic`, `authorId`/`authorName`, timestamps. Only the author can edit or delete their post (enforced in `routes/posts.js`).
- **Private posts**: filtered out of the home feed and blocked (`403`) on direct URL access for anyone but the author.
- **Comments**: Any logged-in user can comment on a post they can see. A comment can be deleted by its author or by the post's owner.
- **Markdown**: The `new`/`edit` forms include a plain `<textarea>` plus a client-side live preview (via `marked` loaded from a CDN in `public/js/editor.js`). On save, the raw Markdown is stored; it's rendered to HTML server-side (also with `marked`) when the post is displayed.
- **Data storage**: `data/db.json` acts as a lightweight database via `models/db.js`. This keeps the project runnable with zero external setup. Swapping in MongoDB/Postgres later would mean rewriting the `models/*.js` files — the routes and views wouldn't need to change.

## Notes & possible next steps

- Sessions currently use the default in-memory store, which resets on server restart — swap in `connect-mongo`, `connect-redis`, etc. for production.
- Add pagination to the home page once the post count grows.
- Add comment editing (the model already supports `Comment.update`) with its own route + small inline form.
- Add input sanitization/escaping for Markdown output if untrusted users can post (currently `marked` output is inserted via `<%- %>`, so consider a sanitizer like `dompurify`/`sanitize-html` before going to production with public sign-ups).
