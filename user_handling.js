import { DatabaseSync } from "node:sqlite";
import * as argon2 from "argon2";

const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);

function getUserByLogin(login) {
  const stmt = db.prepare(
    `SELECT id, login, password FROM users WHERE login = ?`
  );
  return stmt.get(login);
}

function getUserByID(id) {
  const stmt = db.prepare(
    `SELECT id, login FROM users WHERE id = ?`
  );
  return stmt.get(id);
}

async function registerUser(login, password) {
  const existingUser = getUserByLogin(login);
  if (existingUser) {
    return { success: false, message: "User already exists" };
  }

  try {
    const hashedPassword = await argon2.hash(password);
    const stmt = db.prepare(
      `INSERT INTO users (login, password) VALUES (?, ?)`
    );
    stmt.run(login, hashedPassword);
    return { success: true, message: "User registered successfully" };
  } catch (err) {
    return { success: false, message: "Error registering user" };
  }
}

async function authenticateUser(login, password) {
  const user = getUserByLogin(login);
  if (!user) {
    return { success: false, message: "User not found" };
  }

  try {
    const isPasswordValid = await argon2.verify(user.password, password);
    if (isPasswordValid) {
      return { success: true, userId: user.id, login: user.login };
    } else {
      return { success: false, message: "Invalid password" };
    }
  } catch (err) {
    return { success: false, message: "Error authenticating user" };
  }
}

async function initializeAdminUser() {
  try {
    const existingAdmin = getUserByLogin("admin");
    if (!existingAdmin) {
      const hashedPassword = await argon2.hash("overseer");
      const stmt = db.prepare(
        `INSERT INTO users (login, password) VALUES (?, ?)`
      );
      stmt.run("admin", hashedPassword);
      console.log("Admin user created successfully");
    }
  } catch (err) {
    console.log("Admin user already exists or error creating admin");
  }
}

export { getUserByLogin, getUserByID, registerUser, authenticateUser, initializeAdminUser, db };
