import express from "express";
import morgan from "morgan";
import { loadPostsFromDB, addPostToDB, getPostByID, updatePostByID, deletePostByID } from "./post_handling.js";
import { populateSamplePosts, nukeTableRecords } from "./devactions.js";
const port = 8000;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());
app.use(morgan("dev"));

// DEV: Ustawić na true aby dodać przykładowe posty do bazy danych przy uruchomieniu aplikacji
var populate = true;
populateSamplePosts(populate, 50);

// DEV: Ustawić na true aby usunąć WSZYSTKIE istniejące rekordy z tabeli posts przy uruchomieniu aplikacji
var nuke = true;
nukeTableRecords(nuke);

export { populate, nuke };

app.get("/forum", (req, res) => {
  const page = req.query.page || 1;
  const postsPerPage = 10;
  const offset = (page - 1) * postsPerPage;
  
  const allPosts = loadPostsFromDB(postsPerPage + 1, offset);
  const hasNextPage = allPosts.length > postsPerPage;
  const forumPosts = allPosts.slice(0, postsPerPage);
  
  res.render("forum", {
    title: "Posty użytkowników",
    posts: forumPosts,
    currentPage: page,
    postsPerPage: postsPerPage,
    hasNextPage: hasNextPage
  });
});

app.get("/create", (req, res) => {
  res.render("form", {
    title: "Stwórz nowy post"
  });
});
app.get("/wrong_edit_key", (req, res) => {
  res.render("nice_try_buddy", {
    title: "złe hasło"
  });
});

app.post("/create/new", (req, res) => {
  addPostToDB(req.body.title, req.body.author, req.body.text, req.body.edit_key);
  res.redirect("/forum");
});

app.get("/edit/:id", (req, res) => {
  const post = getPostByID(req.params.id);
  if (!post) {
    return res.status(404).send("Post not found");
  }
  res.render("edit_post", {
    title: "Edytuj post",
    post: post
  });
});

app.post("/edit/:id", (req, res) => {
  const success = updatePostByID(req.params.id, req.body.title, req.body.text, req.body.edit_key);
  if (success) {
    res.redirect("/forum");
  } else {
    res.status(403).redirect("/wrong_edit_key");
  }
});

app.get("/delete/:id", (req, res) => {
  const post = getPostByID(req.params.id);
  if (!post) {
    return res.status(404).send("Post not found");
  }
  res.render("delete_post", {
    title: "Usuń post",
    post: post
  });
});

app.post("/delete/:id", (req, res) => {
  const success = deletePostByID(req.params.id, req.body.edit_key);
  if (success) {
    res.redirect("/forum");
  } else {
    res.status(403).redirect("/wrong_edit_key");
  }
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});