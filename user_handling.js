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
    return { success: false, message: "Konto użytkownika już istnieje" };
  }
  if (password.length < 5) {
    return { success: false, message: "Hasło musi mieć minimum 5 znaków" };
  }

  try {
    const hashedPassword = await argon2.hash(password);
    const stmt = db.prepare(
      `INSERT INTO users (login, password) VALUES (?, ?)`
    );
    stmt.run(login, hashedPassword);
    return { success: true, message: "Zarejestrowano pomyślnie" };
  } catch (err) {
    return { success: false, message: "Błąd rejestracji użytkownika" };
  }
}

async function authenticateUser(login, password) {
  const user = getUserByLogin(login);
  if (!user) {
    return { success: false, message: "Nie znaleziono użytkownika" };
  }

  try {
    const isPasswordValid = await argon2.verify(user.password, password);
    if (isPasswordValid) {
      return { success: true, userId: user.id, login: user.login };
    } else {
      return { success: false, message: "Złe hasło" };
    }
  } catch (err) {
    return { success: false, message: "Błąd autentyfikacji" };
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
      console.log("Admin stworzony pomyślnie");
    }
  } catch (err) {
    console.log("Albo admin istnieje, albo wystąpił błąd przy tworzeniu");
  }
}

export { getUserByLogin, getUserByID, registerUser, authenticateUser, initializeAdminUser, db };
