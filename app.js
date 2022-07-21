const express = require("express");
const ejs = require("ejs");

const app = express();

//Body Parser
app.use(express.urlencoded({ extended: true }));

//Using the Public Folder for Statics files
app.use(express.static("public"));

//Setting View Engine to use EJS
app.set("view engine", "ejs");

//Render Home Page
app.get("/", (req, res) => {
  res.render("home");
});

//Render Login Page
app.get("/login", (req, res) => {
  res.render("login");
});

//Render Register Page
app.get("/register", (req, res) => {
  res.render("register");
});

app.listen(3000, () => {
  console.log("Server running at port 3000");
});
