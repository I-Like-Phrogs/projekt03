import { addPostToDB, db } from "./post_handling.js";
import * as argon2 from "argon2";

async function populateSamplePosts(isTrue, numPosts = 25) {
if (isTrue) {
  const checkUser = db.prepare(`SELECT id FROM users WHERE login = 'populated_user'`);
  let userId = checkUser.get()?.id;
  
  if (!userId) {
    const hashedPassword = await argon2.hash('hasło');
    const insertUser = db.prepare(`INSERT INTO users (login, password) VALUES (?, ?)`);
    insertUser.run('populated_user', hashedPassword);
    userId = checkUser.get()?.id;
  }
  
  const sampleTitles = ["Mój pierwszy post", "Ciekawe doświadczenie", "Podróże po Polsce", "Ulubione książki", "Gotowanie na co dzień", "Sport i zdrowie", "Technologie jutra", "Muzyka, która inspiruje", "Sztuka i kultura", "Porady życiowe"];
  const sampleTexts = ["Lorem ipsum", "ciekawa treść", "to jest treść fajnego posta", "(insert text)", "więcej tekstu tutaj", "jeszcze trochę treści", "post pełen informacji"];
  for (let i = 0; i < numPosts; i++) {
    const title = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
    const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    addPostToDB(title, userId, text);
}
console.log(`Added ${numPosts} sample posts to the database.`);
}
isTrue = false;
}

function nukeTableRecords(bigredbutton) {
    if (bigredbutton) {
        const stmt = db.prepare(`DELETE FROM posts`);
        stmt.run();
        const deleteSessionsStmt = db.prepare(`DELETE FROM sessions WHERE userId = (SELECT id FROM users WHERE login = 'populated_user')`);
        deleteSessionsStmt.run();
        const deleteUserStmt = db.prepare(`DELETE FROM users WHERE login = 'populated_user'`);
        deleteUserStmt.run();
        console.log("KABOOOOM!!! All records in the 'posts' table have been deleted.");
    } else {
        console.log("Table deletion aborted: nuke not set to true.");
    }
    bigredbutton = false;
}

export { populateSamplePosts, nukeTableRecords };