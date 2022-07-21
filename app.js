const express = require("express");
const ejs = require("ejs");

const app = express();

//Body Parser
app.use(express.urlencoded({ extended: true }));

//Setting View Engine to use EJS
app.set("view engine", "ejs");

app.listen(3000, () => {
  console.log("Server running at port 3000");
});
