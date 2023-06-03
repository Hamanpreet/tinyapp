/***
 * importing express and setting the engine to ejs
 */
const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const Keygrip = require('keygrip');

const PORT = 8080;
app.set("view engine", "ejs");
//To parse the request buffer data
app.use(express.urlencoded({ extended: true }));
// Generate a set of keys for signing cookies
const keys = new Keygrip(['key1', 'key2', 'key3']);
app.use(cookieSession({
  name: 'session',
  keys: keys,
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
const {getUserByEmail, generateRandomString, urlsForUser} = require("./helpers.js");
//for being able to use delete and put directly instead of post
app.use(methodOverride('_method'));


const urlDatabase = {};

const users = {};

// / => homepage
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

/*
 * Middleware function to handle GET requests to /urls
 * urls_index file in views,so,no need to give path or extension
 * sending back a template & object with data template needs
 */
app.get("/urls", (req, res) => {
  //This was used with cookie-parser, just a diff syntax with cookie session) const user_id = req.cookies.user_id;
  const user_id = req.session.user_id;
  // Look up the specific user object in the 'users' object using the 'user_id' cookie value(need this for header too)
  const user = users[user_id];
  if (!req.session.user_id) {
    return res.status(404).send("You need to be login to be able to do that");
  } else {
    const userURLs = urlsForUser(user_id, urlDatabase);
    const templateVars = {user, urls: userURLs};
    res.render("urls_index", templateVars);
  }
});

//Page opens when we click on create new URL
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect("/login");
  } else {
    const user = users[user_id];
    const templateVars = {user};
    res.render("urls_new", templateVars);
  }
});

//route for displaying tinyURL for longURL
app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const keys = Object.keys(urlDatabase);
  if (!req.session.user_id) {
    return res.status(400).send("You need to be logged in to view that");
  } else if (!keys.includes(req.params.id)) {
    return res.status(404).send("ShortUrl not found");
  } else if (urlDatabase[req.params.id].userID !== user_id) {
    return res.status(404).send("You don't have access to view that");
  } else {
    const user = users[user_id];
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user,};
    res.render("urls_show", templateVars);
  }
});

/**
 * @param {string} id- Given by user in URL accessed by req.params.id in backend
 * @example - if b2xVn2 given in url, longurl is lighthouse one
 */

//If user directly access shortURL, it redirects to longURL from database
//if doesn't exist, send message.
app.get("/u/:id", (req, res) => {
  const urlEntry = urlDatabase[req.params.id];
  if (urlEntry && urlEntry.longURL) {
    res.redirect(urlEntry.longURL);
  } else {
    res.status(404).send("Short URL doesn't exist");
  }
});

//page to register new users
app.get("/register", (req,res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect("/urls");
  }
  const user = users[user_id];
  const templateVars = {user};
  res.render("register.ejs", templateVars);
});

//page to login existing users
app.get("/login", (req,res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect("/urls");
  }
  const user = users[user_id];
  const templateVars = {user};
  res.render("login.ejs",templateVars);
});

//
app.post("/urls/:id",(req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL,};
  res.render("urls_show",templateVars);
});

/**
 * redirects user to display shortURL for the long one (302)
 * @param {string} id - shortURL(key for database obj)
 */

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send("You need to login first");
  }
  const id = generateRandomString();
  urlDatabase[id] =  {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${id}`);
});

//delete the existing URLs
app.delete("/urls/:id", (req, res) => {
  const keys = Object.keys(urlDatabase);
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(400).send("You need to login to delete this");
  }
  if (!keys.includes(req.params.id)) {
    return res.status(403).send("You don't have the permission to delete that");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


//updates the longURL with edit button and redirects back to origin page
app.put("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect("/urls");
});

//log in existing user after all the checks and then redirects
app.post("/login",(req, res) => {
  const foundUser = getUserByEmail(req.body.email, users);
  if (!foundUser) {
    return res.status(403).send("User is not registered");
  }
  
  if (!bcrypt.compareSync(req.body.password, foundUser.password)) {
    return res.status(403).send("Password Incorrect");
  }
  //res.cookie("user_id", foundUser.id ) (this is for using cookie-parser);
  req.session.user_id = foundUser.id;
  res.redirect("/urls");
});

//clears cookie and redirect to login page
app.post("/logout", (req,res) =>{
  req.session = null;
  res.redirect('/login');
});

//register new user in database but first check all the conditions using helper function
app.post("/register", (req,res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("E-mail and password both required");
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("User already exists");
  }
  const id = generateRandomString();
  users[id] = {id: id, email:req.body.email, password: hashedPassword};
  
  req.session.user_id = id;
  res.redirect("/urls");
});

//tells express app to listen on PORT and give a msg on terminal
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});