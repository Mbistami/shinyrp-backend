var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var { expressjwt: jwt } = require("express-jwt");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var graphRouter = require("./routes/mood");
var extractRouter = require("./routes/extract_users");
var userRouter = require("./routes/user");
var sessionsRouter = require("./routes/sessions");
var registerRouter = require("./routes/auth/register");
var loginRouter = require("./routes/auth/login");
var pollCreateRouter = require("./routes/poll/create");
var pollAllRouter = require("./routes/poll/all");
var pollCurrentRouter = require("./routes/poll/current");
var cookieSession = require("cookie-session");
var cors = require("cors");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.set("trust proxy", 1);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser({}));
// app.use(
//   cookieSession({
//     domain: "herokuapp.com",
//     keys: [process.env.SECRET_TOKEN],
//     maxAge: 24 * 60 * 60 * 1000,
//     secure: true,
//     secret: process.env.SECRET_TOKEN,
//     sameSite: "none",
//   })
// );
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});
app.use(express.static(path.join(__dirname, "public")));
app.use(
  jwt({
    secret: process.env.SECRET_TOKEN,
    algorithms: ["HS256"],
    credentialsRequired: false,
    getToken: function fromHeaderOrQuerystring(req) {
      try {
        if (req.cookies["shinyrp-auth-cookie"])
          return req.cookies["shinyrp-auth-cookie"];
        return null;
      } catch (error) {
        return null;
      }
    },
  })
);
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/graph_data", graphRouter);
app.use("/extract", extractRouter);
app.use("/user", userRouter);
app.use("/session", sessionsRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/poll/create", pollCreateRouter);
app.use("/poll/all", pollAllRouter);
app.use("/poll/current", pollCurrentRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
