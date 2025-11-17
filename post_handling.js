const posts = [
  {
    title: "Post",
    author: "John Doe",
    text: "To jest zwykły post na zwykłym forum internetowym."
  },
  {
    title: "Nauka JavaScript",
    author: "Sara G",
    text: "Dlaczego javascript jest taki trudny ong. Ten język nie ma żadnych zasad, czemu nie ma on logiki? Przynajmniej to nie PHP."
  },
  {
    title: "Max Design Pro",
    author: "Cotton Eye Joe",
    text: "gedagedigedagedayo"
  }
];

export function addPost(title, author, text) {
  posts.push({ title, author, text });
}

export { posts };
