const express = require("express");
const app = express();
const passport = require("passport");
const db_connect = require("./db");
require("dotenv").config();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const AuthRoutes = require("./routes/auth");
const SheetsRoutes = require("./routes/sheets");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

require("./auth")(passport);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", AuthRoutes);
app.use("/sheets", SheetsRoutes);
app.use("/home", (req, res) => {
  return res.send(
    "<h1>You are authenticated!</h1></br><h3>use => : GET: /sheets/:sheetId to get the spreadsheet’s and.</h3></br><h3>use => POST: /sheets/update to update a paticular cell in the sheet.</h3>"
  );
});

app.listen(process.env.PORT, async () => {
  db_connect();
  console.log(`server is listening at port ${process.env.PORT}`);
});
