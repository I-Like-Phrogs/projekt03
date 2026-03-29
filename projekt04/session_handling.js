import { DatabaseSync } from "node:sqlite";
import { createHmac } from "crypto";

const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);


const SESSION_SECRET = process.env.SESSION_SECRET || "your-secret-key-change-this-in-production";
const SESSION_EXPIRATION_HOURS = 24;

function initializeSessionsTable() {
  db.exec(
    `CREATE TABLE IF NOT EXISTS sessions (
      id              INTEGER PRIMARY KEY,
      sessionId       TEXT NOT NULL UNIQUE,
      userId          INTEGER NOT NULL,
      sessionHash     TEXT NOT NULL,
      createdAt       DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiresAt       DATETIME NOT NULL,
      lastActivity    DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );`
  );
  

  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_sessions_sessionId ON sessions(sessionId);`
  );
  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_sessions_expiresAt ON sessions(expiresAt);`
  );
}


function generateSessionHash(sessionId) {
  return createHmac("sha256", SESSION_SECRET)
    .update(sessionId)
    .digest("hex");
}


function createSession(userId) {
  try {
    const sessionId = createHmac("sha256", SESSION_SECRET)
      .update(Math.random().toString() + Date.now())
      .digest("hex")
      .substring(0, 32);
    
    const sessionHash = generateSessionHash(sessionId);
    const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_HOURS * 60 * 60 * 1000).toISOString();
    
    const stmt = db.prepare(
      `INSERT INTO sessions (sessionId, userId, sessionHash, expiresAt) 
       VALUES (?, ?, ?, ?)`
    );
    
    stmt.run(sessionId, userId, sessionHash, expiresAt);
    return { sessionId, expiresAt };
  } catch (err) {
    console.error("Error creating session:", err);
    return null;
  }
}

function getSession(sessionId) {
  try {
    const expectedHash = generateSessionHash(sessionId);
    
    const stmt = db.prepare(
      `SELECT id, sessionId, userId, sessionHash, expiresAt, lastActivity 
       FROM sessions 
       WHERE sessionId = ? AND expiresAt > CURRENT_TIMESTAMP`
    );
    
    const session = stmt.get(sessionId);
    
    if (!session) {
      return null; 
    }
    
    if (session.sessionHash !== expectedHash) {
      console.warn(`Potential tampering detected: Session ID ${sessionId} has invalid signature`);
      destroySession(sessionId);
      return null;
    }
    
    return session;
  } catch (err) {
    console.error("Error getting session:", err);
    return null;
  }
}

function updateSessionActivity(sessionId) {
  try {
    const stmt = db.prepare(
      `UPDATE sessions 
       SET lastActivity = CURRENT_TIMESTAMP 
       WHERE sessionId = ? AND expiresAt > CURRENT_TIMESTAMP`
    );
    
    const result = stmt.run(sessionId);
    return result.changes > 0;
  } catch (err) {
    console.error("Error updating session activity:", err);
    return false;
  }
}

function destroySession(sessionId) {
  try {
    const stmt = db.prepare(`DELETE FROM sessions WHERE sessionId = ?`);
    const result = stmt.run(sessionId);
    return result.changes > 0;
  } catch (err) {
    console.error("Error destroying session:", err);
    return false;
  }
}


function cleanupExpiredSessions() {
  try {
    const stmt = db.prepare(`DELETE FROM sessions WHERE expiresAt < CURRENT_TIMESTAMP`);
    const result = stmt.run();
    if (result.changes > 0) {
      console.log(`Cleaned up ${result.changes} expired sessions`);
    }
    return result.changes;
  } catch (err) {
    console.error("Error cleaning up expired sessions:", err);
    return 0;
  }
}


function getUserFromSession(sessionId) {
  try {
    const session = getSession(sessionId);
    if (!session) {
      return null;
    }
    

    updateSessionActivity(sessionId);
    

    const userStmt = db.prepare(`SELECT id, login FROM users WHERE id = ?`);
    const user = userStmt.get(session.userId);
    
    return user;
  } catch (err) {
    console.error("Error getting user from session:", err);
    return null;
  }
}


function destroyUserSessions(userId) {
  try {
    const stmt = db.prepare(`DELETE FROM sessions WHERE userId = ?`);
    const result = stmt.run(userId);
    return result.changes;
  } catch (err) {
    console.error("Error destroying user sessions:", err);
    return 0;
  }
}

export {
  initializeSessionsTable,
  createSession,
  getSession,
  destroySession,
  updateSessionActivity,
  cleanupExpiredSessions,
  getUserFromSession,
  destroyUserSessions,
  db
};
