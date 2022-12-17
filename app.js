const mongoose = require("mongoose");
const dbpath = require("./config/connection");
mongoose.connect(dbpath.dbpath, () => {
  console.log("Database Connected.");
});

const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const { appendFile } = require("fs");

const adminRoute = require("./routes/adminRoute");
const userRoute = require("./routes/userRoute");


const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/user")));
app.use("/admin", express.static(path.join(__dirname, "public/admin")));

app.use(expressLayouts);
app.set("layout", "./layouts/layout");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/admin", express.static("public/admin"));
app.use("/", express.static("public/user"));

app.use("/", userRoute);
app.use("/admin", adminRoute);

app.listen(3000, () => {
  console.log("server is running");
});
