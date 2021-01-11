if(process.env.NODE_ENV !== "production")
{
    require("dotenv").config();
}

//Packages

const  express        = require("express"),
       bodyParser     = require("body-parser"),
       mongoose       = require("mongoose"),
       methodOverride = require("method-override"),
       passport       = require("passport"),
       cookieSession  = require("cookie-session"),
       GoogleStrategy = require("passport-google-oauth20"),
       flash          = require("connect-flash"),
       mongoSanitize  = require('express-mongo-sanitize');

//Routes

const categoryRoutes = require("./routes/category"),
      lineupRoutes   = require("./routes/lineup"),
      productRoutes  = require("./routes/product"),
      reviewRoutes   = require("./routes/review"),
      cartRoutes     = require("./routes/cart"),
      wishlistRoutes = require("./routes/wishlist"),
      paymentRoutes  = require("./routes/payment"),
      orderRoutes    = require("./routes/order"),
      authRoutes     = require("./routes/index");

// DB url

// const dbURL = process.env.DB_URL;

const dbURL = "mongodb://localhost/dyokara";

//Models

const User = require("./models/User");
const Tracking = require("./models/Tracking");
const Order = require("./models/Order");
const Product = require("./models/Product");

//Mongoose setup

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(dbURL);

//App setup

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(mongoSanitize());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//Session configuration

// app.use
// (
//     require("express-session")
//     (
//         {
//             secret: "Living in style!",
//             resave: false,
//             saveUninitialized: false
//         }
//     )
// );

// const store = new MongoStore
// (
//     {
//         url: dbURL,
//         secret: 'Living in style!',
//         touchAfter: 24 * 60 * 60
//     }
// )

app.use(cookieSession
    (
        {
            maxAge: 12 * 30 * 24 * 60 * 60 * 1000,
            keys: [process.env.SESSIONKEY]
        }
    )
)

//Passport setup

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(
    (user, done) =>
    {
        done(null, user.id);
    }
)

passport.deserializeUser(
    (id, done) =>
    {
        User.findById(id,
            (err, foundUser) =>
            {
                done(null, foundUser);
            }    
        );
    }
)

passport.use(new GoogleStrategy
    (
        {
            clientID: `${process.env.CLIENTID}`,
            clientSecret: `${process.env.CLIENTSECRET}`,
            callbackURL: "/google/redirect"
        },
        (accessToken, refreshToken, profile, done) =>
        {
            User.findOne({googleId: profile.id},
                (err, foundUser) =>
                {
                    if(foundUser)
                    {
                        done(null, foundUser);
                    }

                    else
                    {
                        const newUser = 
                        {
                            username: profile.displayName,
                            googleId: profile.id
                        };

                        User.create(newUser,
                            (err, user) =>
                            {
                                if(err)
                                {
                                    console.log(err);
                                }
                                else
                                {
                                    done(null, user);
                                }
                            }
                        )
                    }
                }    
            )
        }
    )
);

//Use on all routes

app.use
(
    (req, res, next) =>
    {
        res.locals.currentUser = req.user;
        res.locals.error = req.flash("error");
        res.locals.success = req.flash("success");
        next();
    }
)

// Create new tracking object

// Tracking.findOne({name: "primary"},
//     async(err, track) =>
//     {
//         if(err)
//         {
//             res.send(err);
//         }
//         else
//         {
//             track.currentOrderNumber = 1;
//             await track.save();
//             console.log("Updated");
//         }
//     }
// )

// Tracking.deleteMany({name: "primary"},
//     (err) =>
//     {
//         if(err)
//         console.log(err);
//         else
//         console.log("Deleted!");
//     }
// )

// Product.deleteMany({name: "Clock"},
//     (err) =>
//     {
//         if(err)
//         console.log(err);
//         else
//         console.log("Deleted!");
//     }
// )

// const primaryTrack = 
// {
//     name: "primary",
//     currentOrderNumber: 1,
//     currentLineupNumber: 0,
// };

// Tracking.create(primaryTrack,
//     (err, track) =>
//     {
//         if(err)
//         {
//             console.log("Primary track could not be created");
//         }
//         else
//         {
//             console.log("Primary track created!");
//         }
//     }    
// )

// Order.deleteMany({},
//     (err) =>
//     {
//         if(err)
//         console.log(err);
//         else
//         console.log("Deleted!");
//     }
// )

//The routes

app.use("/categories", categoryRoutes);
app.use("/lineups", lineupRoutes);
app.use("/products", productRoutes);
app.use("/products/:id/reviews", reviewRoutes);
app.use("/users/:id/cart", cartRoutes);
app.use("/users/:id/wishlist", wishlistRoutes);
app.use("/payments", paymentRoutes);
app.use("/orders", orderRoutes);
app.use(authRoutes);

//Catch all 

app.get("*",
    (req, res) =>
    {
        res.send("ERROR 404! PAGE NOT FOUND!");
    }
)

const port = process.env.PORT || 3000;

app.listen(port, 
    () =>
    {
        console.log("Server online.....");
    }
)
