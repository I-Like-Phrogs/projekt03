import { DatabaseSync } from "node:sqlite";
const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);


console.log("robimy jeśli nie ma tabelę posts");
db.exec(
  `CREATE TABLE IF NOT EXISTS posts (
    id        INTEGER PRIMARY KEY,
    title     TEXT NOT NULL,
    author_name    TEXT NOT NULL,
    text      TEXT NOT NULL,
    edit_key  TEXT NOT NULL
  );`
);

const posts = [];

function loadPostsFromDB(limit = 10, offset = 0) {
  const stmt = db.prepare(
    `SELECT id, title, author_name AS author, text, edit_key FROM posts LIMIT ? OFFSET ?`
  );
  return stmt.all(limit, offset);
}

function getPostByID(id) {
  const stmt = db.prepare(
    `SELECT id, title, author_name AS author, text, edit_key FROM posts WHERE id = ?`
  );
  return stmt.get(id);
}

function updatePostByID(id, title, text, edit_key) {
  const stmt = db.prepare(
    `UPDATE posts SET title = ?, text = ? WHERE id = ? AND edit_key = ?`
  );
  const result = stmt.run(title, text, id, edit_key);
  return result.changes > 0;
}

function deletePostByID(id, edit_key) {
  const stmt = db.prepare(
    `DELETE FROM posts WHERE id = ? AND edit_key = ?`
  );
  const result = stmt.run(id, edit_key);
  return result.changes > 0;
}

function addPostToDB(title, author, text, edit_key = "edit") {
  const stmt = db.prepare(
    `INSERT INTO posts (title, author_name, text, edit_key) VALUES (?, ?, ?, ?)`
  );
  stmt.run(title, author, text, edit_key);
}


export { posts, loadPostsFromDB, addPostToDB, db, getPostByID, updatePostByID, deletePostByID };
