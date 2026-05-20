import { addPostToDB, db } from "./post_handling.js";
import { getUserByLogin, registerUser } from "./user_handling.js";
import { destroyUserSessions } from "./session_handling.js";

async function populateSamplePosts(isTrue, numPosts = 25) {
if (isTrue) {
  let user = getUserByLogin('populated_user');
  
  if (!user) {
    await registerUser('populated_user', 'hasło');
    user = getUserByLogin('populated_user');
  }
  
  const userId = user.id;
  
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
        const user = getUserByLogin('populated_user');
        
        if (user) {
            destroyUserSessions(user.id);
            const stmt = db.prepare(`DELETE FROM posts WHERE user_id = ?`);
            stmt.run(user.id);
            const deleteUserStmt = db.prepare(`DELETE FROM users WHERE login = 'populated_user'`);
            deleteUserStmt.run();
        }
        console.log("KABOOOOM!!! All records in the 'posts' table have been deleted.");
    } else {
        console.log("Table deletion aborted: nuke not set to true.");
    }
    bigredbutton = false;
}

export { populateSamplePosts, nukeTableRecords };