////////////////// Level 6 - Google OAuth 2.0 Authentication /////////////////
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

//Body Parser
app.use(express.urlencoded({ extended: true }));

//Using the Public Folder for Statics files
app.use(express.static("public"));

//Setting View Engine to use EJS
app.set("view engine", "ejs");

// Initialise Session
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

//Initialise Passport
app.use(passport.initialize());
//Make app use passport to setup our session
app.use(passport.session());

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
    googleId: String,
  });

  //use passportLocalMongoose in userSchema as a plugin
  userSchema.plugin(passportLocalMongoose);
  //Use findOrCreate as a plugin in userSchema
  userSchema.plugin(findOrCreate);

  // User Model
  const User = new mongoose.model("User", userSchema);

  //simplified Passport local configurations
  // CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
  passport.use(User.createStrategy());

  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture,
      });
    });
  });

  passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });

  // Configuring Strategy

  //Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets",
      },
      function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
          return cb(err, user);
        });
      }
    )
  );

  //////////////////////////////////////  App.Get //////////////////////////////////////

  //Render Home Page
  app.get("/", (req, res) => {
    res.render("home");
  });

  //To Authenticate using google
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile"] })
  );

  //a Callback from google after it has authenticated
  app.get(
    "/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
      // Successful authentication, redirect to secrets.
      res.redirect("/secrets");
    }
  );

  //Render Login Page
  app.get("/login", (req, res) => {
    res.render("login");
  });

  //Render Register Page
  app.get("/register", (req, res) => {
    res.render("register");
  });

  //Render Secrets Page
  app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
      res.render("secrets");
    } else {
      res.render("login");
    }
  });

  //Logout Route
  app.get("/logout", (req, res) => {
    req.logout((err) => {
      if (!err) {
        res.redirect("/login");
      } else {
        return next(err);
      }
    });
  });

  //////////////////////////////////////  App.Post /////////////////////////////////////

  // Post route for register page
  app.post("/register", (req, res) => {
    User.register(
      { username: req.body.username },
      req.body.password,
      (err, user) => {
        if (!err) {
          passport.authenticate("local")(req, res, () => {
            res.redirect("/secrets");
          });
        } else {
          console.log(err);
          res.redirect("/register");
        }
      }
    );
  });

  // post route for login page
  app.post("/login", (req, res) => {
    const newUser = new User({
      username: req.body.username,
      password: req.body.password,
    });

    passport.authenticate("local")(req, res, () => {
      res.render("secrets");
    });
  });

  //////////////////////////////////////  App.Listen ///////////////////////////////////

  app.listen(3000, () => {
    console.log("Server running at port 3000");
  });
}
