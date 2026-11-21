import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
  );

  CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL
  );

  CREATE INDEX idx_posts_user_id ON posts(user_id);
`);

const insertUser = db.prepare('INSERT INTO users (email, name) VALUES (?, ?)');
const insertPost = db.prepare('INSERT INTO posts (user_id, title) VALUES (?, ?)');

insertUser.run('alice@example.com', 'Alice');
insertUser.run('bob@example.com', 'Bob');

insertPost.run(1, 'Hello');
insertPost.run(1, 'Second post');
insertPost.run(2, 'Bob writes');

console.log('users:');
console.table(db.prepare('SELECT * FROM users').all());

console.log('posts with authors (JOIN):');
console.table(
  db
    .prepare(
      `SELECT posts.id, posts.title, users.name AS author
       FROM posts
       JOIN users ON users.id = posts.user_id
       ORDER BY posts.id`,
    )
    .all(),
);

console.log('query plan for the indexed lookup:');
console.table(
  db.prepare('EXPLAIN QUERY PLAN SELECT * FROM posts WHERE user_id = ?').all(1),
);

db.exec('BEGIN');
try {
  insertUser.run('carol@example.com', 'Carol');
  insertPost.run(3, "Carol's first post");
  db.exec('COMMIT');
  console.log('transaction committed');
} catch (err) {
  db.exec('ROLLBACK');
  throw err;
}

console.log(
  'counts after transaction:',
  db.prepare('SELECT COUNT(*) AS users FROM users').get(),
);

try {
  insertUser.run('alice@example.com', 'Duplicate Alice');
} catch (err) {
  console.log('unique constraint rejected a duplicate:', err.message);
}

db.close();
