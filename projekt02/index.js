import express from "express";
import { posts } from "./post_handling.js";
const port = 8000;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());

app.get("/forum", (req, res) => {
  res.render("forum", {
    title: "Posty użytkowników",
    posts: posts
  });
});

app.get("/create", (req, res) => {
  res.render("form", {
    title: "Stwórz nowy post",
    posts: posts
  });
});

app.post("/create/new", (req, res) => {
  const newPost = {
    title: req.body.title,
    author: req.body.author,
    text: req.body.text
  };
  posts.push(newPost);
  res.redirect("/forum");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});