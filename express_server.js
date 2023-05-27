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

const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};
app.post("/login",(req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});


/**
 * Middleware function to handle GET requests to /urls
 * @param {object} templateVars
 * urls_index file in views,so,no need to give path or extension
 * sending back a template & object with data template needs
 */
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"],};
  res.render("urls_index", templateVars);
});

//page opens when we click on create new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"],};
  res.render("urls_new", templateVars);
});

//updates the longURL with edit button
app.post("/urls/:id/update", (req, res) => {
 urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
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

/**
 * @param {string} id- Given by user in URL accessed by req.params.id in backend 
 * @example - if b2xVn2 given in url, longurl is lighthouse one
 */
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

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