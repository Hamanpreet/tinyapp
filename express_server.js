/***
 * importing express and setting the engine to ejs
 */
const express = require("express");
const app = express();
const PORT = 8080;  

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/**
 * Render the urls
 * param {object} @templateVars
 * urls_index file in views, so,no need to give path or extension
 */
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

/**
 * @param {string} id- Given by user in URL accessed by req.params.id 
 * @example - if b2xVn2 given in url, longurl is lighthouse one
 */
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});