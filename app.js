const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const expressHandleBars = require("express-handlebars");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const mongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override");
const {
  formatDate,
  truncate,
  stripTags,
  editIcon,
  select,
} = require("./helpers/hbs");
require("dotenv").config();
require("./auth/passport")(passport);

const PORT = process.env.PORT || 5000;

mongoose.connect(
  process.env.DB_URI,
  {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  },
  () => {
    console.log("Connected to DB");
  }
);

const app = express();

//Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Handlebars
app.engine(
  ".hbs",
  expressHandleBars({
    defaultLayout: "base",
    extname: ".hbs",
    helpers: { formatDate, truncate, stripTags, editIcon, select },
  })
);
app.set("view engine", ".hbs");

//Sessions
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//Passport auth
app.use(passport.initialize());
app.use(passport.session());

//Static files
app.use(express.static(path.join(__dirname, "public")));

//Globals
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

//Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/posts", require("./routes/posts"));

app.listen(PORT, () => {
  console.log(`Running on PORT : ${PORT} in ${process.env.NODE_ENV}`);
});
