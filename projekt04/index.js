import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { loadPostsFromDB, addPostToDB, getPostByID, updatePostByID, deletePostByID, canEditPost, canDeletePost } from "./post_handling.js";
import { populateSamplePosts, nukeTableRecords } from "./devactions.js";
import { registerUser, authenticateUser, getUserByID } from "./user_handling.js";
import { createSession, destroySession, getUserFromSession, cleanupExpiredSessions } from "./session_handling.js";
const port = 8000;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());
app.use(cookieParser());
app.use(morgan("dev"));

app.use((req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId) {
    const user = getUserFromSession(sessionId);
    if (user) {
      req.user = user;
      req.sessionId = sessionId;
    }
  }
  next();
});

setInterval(() => {
  cleanupExpiredSessions();
}, 60 * 60 * 1000);

cleanupExpiredSessions();

(async () => {
  var populate = false;
  await populateSamplePosts(populate);

  var nuke = false;
  nukeTableRecords(nuke);
})();

app.get("/forum", (req, res) => {
  const page = req.query.page || 1;
  const postsPerPage = 10;
  const offset = (page - 1) * postsPerPage;
  
  const allPosts = loadPostsFromDB(postsPerPage + 1, offset);
  const hasNextPage = allPosts.length > postsPerPage;
  const forumPosts = allPosts.slice(0, postsPerPage);
  
  const postsWithPermissions = forumPosts.map(post => ({
    ...post,
    canEdit: req.user && canEditPost(post.id, req.user.id),
    canDelete: req.user && canDeletePost(post.id, req.user.id)
  }));
  
  res.render("forum", {
    title: "Posty użytkowników",
    posts: postsWithPermissions,
    currentPage: page,
    postsPerPage: postsPerPage,
    hasNextPage: hasNextPage,
    user: req.user
  });
});

app.get("/create", (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  res.render("form", {
    title: "Stwórz nowy post",
    user: req.user
  });
});

app.post("/create/new", (req, res) => {
  if (!req.user) {
    return res.status(403).send("You must be logged in to create a post");
  }
  addPostToDB(req.body.title, req.user.id, req.body.text);
  res.redirect("/forum");
});

app.get("/edit/:id", (req, res) => {
  const post = getPostByID(req.params.id);
  if (!post) {
    return res.status(404).send("Post not found");
  }
  
  if (!req.user || !canEditPost(req.params.id, req.user.id)) {
    return res.status(403).send("You do not have permission to edit this post");
  }
  
  res.render("edit_post", {
    title: "Edytuj post",
    post: post,
    user: req.user
  });
});

app.post("/edit/:id", (req, res) => {
  if (!req.user || !canEditPost(req.params.id, req.user.id)) {
    return res.status(403).send("You do not have permission to edit this post");
  }
  
  const success = updatePostByID(req.params.id, req.body.title, req.body.text);
  if (success) {
    res.redirect("/forum");
  } else {
    res.status(404).send("Post not found");
  }
});

app.get("/delete/:id", (req, res) => {
  const post = getPostByID(req.params.id);
  if (!post) {
    return res.status(404).send("Post not found");
  }
  
  if (!req.user || !canDeletePost(req.params.id, req.user.id)) {
    return res.status(403).send("You do not have permission to delete this post");
  }
  
  res.render("delete_post", {
    title: "Usuń post",
    post: post,
    user: req.user
  });
});

app.post("/delete/:id", (req, res) => {
  if (!req.user || !canDeletePost(req.params.id, req.user.id)) {
    return res.status(403).send("You do not have permission to delete this post");
  }
  
  const success = deletePostByID(req.params.id);
  if (success) {
    res.redirect("/forum");
  } else {
    res.status(404).send("Post not found");
  }
});

app.get("/login", (req, res) => {
  res.render("base_login", {
    title: "Zaloguj się"
  });
});

app.post("/authenticate_acc", async (req, res) => {
  const { login, haslo } = req.body;
  const result = await authenticateUser(login, haslo);
  
  if (result.success) {
    const session = createSession(result.userId);
    
    if (session) {
      res.cookie("sessionId", session.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000
      });
      res.redirect("/forum");
    } else {
      res.render("base_login", {
        title: "Zaloguj się",
        error: "Error creating session"
      });
    }
  } else {
    res.render("base_login", {
      title: "Zaloguj się",
      error: result.message
    });
  }
});

app.get("/register", (req, res) => {
  res.render("base_register", {
    title: "Zarejestruj się"
  });
});

app.post("/create_acc", async (req, res) => {
  const { login, haslo } = req.body;
  const result = await registerUser(login, haslo);
  
  if (result.success) {
    res.render("base_login", {
      title: "Zaloguj się",
      message: "Account created successfully! Now log in."
    });
  } else {
    res.render("base_register", {
      title: "Zarejestruj się",
      error: result.message
    });
  }
});

app.get("/logout", (req, res) => {
  if (req.sessionId) {
    destroySession(req.sessionId);
  }
  res.clearCookie("sessionId");
  res.redirect("/forum");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});