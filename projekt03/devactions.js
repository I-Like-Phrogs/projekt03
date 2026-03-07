import { addPostToDB, db } from "./post_handling.js";
function populateSamplePosts(isTrue, numPosts = 25) {
if (isTrue) {
  const sampleAuthors = ["Jan Kowalski", "Anna Nowak", "Piotr Wiśniewski", "Katarzyna Wójcik", "Michał Kamiński", "Agnieszka Lewandowska", "Tomasz Zieliński", "Magdalena Szymańska", "Paweł Woźniak", "Joanna Kaczmarek"];
  const sampleTitles = ["Mój pierwszy post", "Ciekawe doświadczenie", "Podróże po Polsce", "Ulubione książki", "Gotowanie na co dzień", "Sport i zdrowie", "Technologie jutra", "Muzyka, która inspiruje", "Sztuka i kultura", "Porady życiowe"];
  const sampleTexts = ["Lorem ipsum", "ciekawa treść", "to jest treść fajnego posta", "(insert text)", "więcej tekstu tutaj", "jeszcze trochę treści", "post pełen informacji"];
  for (let i = 0; i < numPosts; i++) {
    const title = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
    const author = sampleAuthors[Math.floor
      (Math.random() * sampleAuthors.length)];
    const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    addPostToDB(title, author, text);
}
console.log(`Added ${numPosts} sample posts to the database.`);
}
isTrue = false;
}

function nukeTableRecords(bigredbutton) {
    if (bigredbutton) {
        const stmt = db.prepare(`DELETE FROM posts`);
        stmt.run();
        console.log("KABOOOOM!!! All records in the 'posts' table have been deleted.");
    } else {
        console.log("Table deletion aborted: nuke not set to true.");
    }
    bigredbutton = false;
}

export { populateSamplePosts, nukeTableRecords };