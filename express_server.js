/***
 * importing express and setting the engine to ejs
 */
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const PORT = 8080;  
app.set("view engine", "ejs");
//To parse the request buffer data
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

/**
 * Middleware function to handle GET requests to /urls
 * @param {object} templateVars
 * urls_index file in views,so,no need to give path or extension
 * sending back a template & object with data template needs
 */
app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  // Look up the specific user object in the 'users' object using the 'user_id' cookie value
  const user = users[user_id];
  const templateVars = {user, urls:urlDatabase};
  res.render("urls_index", templateVars);
});

//page opens when we click on create new URL
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  // Look up the specific user object in the 'users' object using the 'user_id' cookie value
  const user = users[user_id];
  const templateVars = {user, urls: urlDatabase};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"], user};
  res.render("urls_show", templateVars);
});

app.get("/register", (req,res) => {
res.render("register.ejs");
});

app.post("/urls/:id",(req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"]};
  res.render("urls_show",templateVars);
});

/**
 * redirects user to display shortURL for the long one (302)
 * @param {string} id - shortURL(key for database obj)
 */

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//updates the longURL with edit button
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
   res.redirect("/urls");
});

app.post("/login",(req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});


app.post("/logout", (req,res) =>{
  res.clearCookie('username');
  res.redirect("urls");
});

app.post("/register", (req,res) => {
  const id = generateRandomString();
  users[id] = {id: id, email:req.body.email, password: req.body.password};
  res.cookie("user_id",id);
  //console.log(users);
  res.redirect("/urls");
});

/**
 * @param {string} id- Given by user in URL accessed by req.params.id in backend 
 * @example - if b2xVn2 given in url, longurl is lighthouse one
 */


/**
 * If user directly access shortURL, it redirects to longURL from database
 * if doesn't exist, send message.
 */

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
  }
  else {
    res.send("Short URL not found");
  } 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});