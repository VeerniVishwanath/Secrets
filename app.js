////////////////// Level 4.1 - Hashing and Salting with argon2 /////////////////
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const argon2 = require("argon2");

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
  app.post("/register", async (req, res) => {
    try {
      // Creating new User in DataBase
      const newUser = new User({
        email: req.body.username,
        password: await argon2.hash(req.body.password),
      })
        .save()
        .then(() => {
          res.render("secrets");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  });

  // post route for login page
  app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Find in the database
    User.findOne({ email: username }, async (err, foundUser) => {
      if (!err) {
        if (foundUser) {
          try {
            if (await argon2.verify(foundUser.password, password)) {
              res.render("secrets");
            }
          } catch (err) {
            console.log(err);
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
