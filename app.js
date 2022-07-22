///////////////////Level 1 - Username and Password Only///////////////////

const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

//Body Parser
app.use(express.urlencoded({ extended: true }));

//Using the Public Folder for Statics files
app.use(express.static("public"));

//Setting View Engine to use EJS
app.set("view engine", "ejs");

//Calling Main function
main().catch((err) => console.log(err));

//Declaring Main function
async function main() {
  //Connecting to MongoDB
  const url = "mongodb://127.0.0.1:27017/";
  const Path = "userDB";
  await mongoose.connect(url + Path);

  //////////////////////////////  MongoDB Schema and Model /////////////////////////////

  // User Schema
  const userSchema = new mongoose.Schema({
    email: String,
    password: String,
  });

  // User Model
  const User = new mongoose.model("User", userSchema);

  //////////////////////////////////////  App.Get //////////////////////////////////////

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

  //////////////////////////////////////  App.Post /////////////////////////////////////

  // Post route for register page
  app.post("/register", (req, res) => {
    // Creating new User in DataBase
    const newUser = new User({
      email: req.body.username,
      password: req.body.password,
    })
      .save()
      .then(() => {
        res.render("secrets");
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // post route for login page
  app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Find in the database
    User.findOne({ email: username }, (err, foundUser) => {
      if (!err) {
        if (foundUser) {
          if (foundUser.password === password) {
            res.render("secrets");
          }
        }
      } else {
        console.log(err);
      }
    });
  });

  //////////////////////////////////////  App.Listen ///////////////////////////////////

  app.listen(3000, () => {
    console.log("Server running at port 3000");
  });
}
