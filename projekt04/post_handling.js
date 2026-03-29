import { DatabaseSync } from "node:sqlite";
import { initializeAdminUser } from "./user_handling.js";
import { initializeSessionsTable } from "./session_handling.js";

const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);

db.exec(
  `CREATE TABLE IF NOT EXISTS posts (
    id        INTEGER PRIMARY KEY,
    title     TEXT NOT NULL,
    user_id   INTEGER NOT NULL,
    text      TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );`
);
db.exec(
  `CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY,
    login     TEXT NOT NULL UNIQUE,
    password  TEXT NOT NULL
  );`
);


initializeSessionsTable();

await initializeAdminUser();

function loadPostsFromDB(limit = 10, offset = 0) {
  const stmt = db.prepare(
    `SELECT posts.id, posts.title, users.login AS author, posts.text, posts.user_id FROM posts JOIN users ON posts.user_id = users.id LIMIT ? OFFSET ?`
  );
  return stmt.all(limit, offset);
}

function getPostByID(id) {
  const stmt = db.prepare(
    `SELECT posts.id, posts.title, users.login AS author, posts.text, posts.user_id FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?`
  );
  return stmt.get(id);
}

function canEditPost(postId, userId) {
  const stmt = db.prepare(
    `SELECT user_id FROM posts WHERE id = ?`
  );
  const post = stmt.get(postId);
  if (!post) return false;
  
  const userStmt = db.prepare(`SELECT login FROM users WHERE id = ?`);
  const user = userStmt.get(userId);
  
  return user && (user.login === "admin" || post.user_id === userId);
}

function canDeletePost(postId, userId) {
  return canEditPost(postId, userId);
}

function updatePostByID(id, title, text) {
  const stmt = db.prepare(
    `UPDATE posts SET title = ?, text = ? WHERE id = ?`
  );
  const result = stmt.run(title, text, id);
  return result.changes > 0;
}

function deletePostByID(id) {
  const stmt = db.prepare(
    `DELETE FROM posts WHERE id = ?`
  );
  const result = stmt.run(id);
  return result.changes > 0;
}

function addPostToDB(title, user_id, text) {
  const stmt = db.prepare(
    `INSERT INTO posts (title, user_id, text) VALUES (?, ?, ?)`
  );
  stmt.run(title, user_id, text);
}

export { loadPostsFromDB, addPostToDB, db, getPostByID, updatePostByID, deletePostByID, canEditPost, canDeletePost };
