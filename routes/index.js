const express = require("express"),
     passport = require("passport");

const middleware = require("../middleware");

const User = require("../models/User.js");

const router = express.Router();



//Home 

router.get("/",
    (req, res) => 
    {
        res.render("landing");
    }
)

//New 

router.get("/register",
    (req, res) => 
    {
        res.render("user/register");
    }
)

//Create 

router.post("/register",
    (req, res) =>
    {
        var newUser = new User({ username: req.body.username });

        User.register(newUser, req.body.password,
            (err, user) =>
            {
                if(err) 
                {
                    res.redirect("/register");
                }
                else 
                {
                    passport.authenticate("local")(req, res,
                        () =>
                        {
                            res.redirect("/products");
                        }
                    )
                }
            }
        )
    }
)

//Login

//Form 

router.get("/login",
    (req, res) =>
    {
        res.render("user/login");
    }
)

//Authenticate

router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/products",
        failureRedirect: "/login"
    }
), (req, res) =>
   {}
)

//Logout

router.get("/logout",
    (req, res) =>
    {
        req.logout();
        res.redirect("/");
    }
)

//Checkout

router.get("/checkout", middleware.isLoggedIn,
    (req,res) =>
    {
        User.findById(req.user.id,
			(err, user) =>
			{
				if(err)
				{
					console.log(err);
				}
				else
				{
					res.render("user/checkout", {cart: user.cart});	
				}
			}
		);
	}
)

//Catch all 

router.get("*",
    (req, res) =>
    {
        res.send("ERROR 404! PAGE NOT FOUND!");
    }
)

module.exports = router;