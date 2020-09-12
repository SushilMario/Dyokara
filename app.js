//Packages

const  express = require("express"),
    bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
methodOverride = require("method-override"),
      passport = require("passport"),
 LocalStrategy = require("passport-local");

//Routes

const productRoutes  = require("./routes/product"),
      reviewRoutes   = require("./routes/review"),
      cartRoutes     = require("./routes/cart"),
      wishlistRoutes = require("./routes/wishlist"),
      authRoutes     = require("./routes/index");

//Models

const User = require("./models/User");

//Mongoose setup

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/dyokara");

//App setup

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

//Passport configuration

app.use
(
    require("express-session")
    (
        {
            secret: "Living in style!",
            resave: false,
            saveUninitialized: false
        }
    )
);

//Passport setup

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Use on all routes

app.use
(
    (req, res, next) =>
    {
        res.locals.currentUser = req.user;
        next();
    }
)

//The routes

app.use("/products", productRoutes);
app.use("/products/:id/reviews", reviewRoutes);
app.use("/users/:id/cart", cartRoutes);
app.use("/users/:id/wishlist", wishlistRoutes);
app.use(authRoutes);

const port = process.env.PORT || 3000;

app.listen(port, 
    () =>
    {
        console.log("Server online.....");
    }
)