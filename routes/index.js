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

router.get("/login",
    (req, res) => 
    {
        res.render("user/login");
    }
)

//Redirect to google

router.get("/google", passport.authenticate
    (
        'google',
        {
            scope: ['profile']
        }
    )
)

//Handle redirect from google

router.get("/google/redirect", passport.authenticate('google'),
    (req, res) =>
    {
        if(!req.user.phoneNumber)
        {
            res.redirect("/login/details");
        }
        else
        {
            res.redirect("/products");
        }
    }
)

//Create 

router.get("/login/details",
    (req, res) =>
    {
        if(req.user.phoneNumber && req.user.shippingAddress)
        {
            res.redirect("/products");
        }
        res.render("user/detailsNew");
    }
)

router.post("/login/details",
    (req, res) =>
    {
        const {phoneNumber, shippingAddress} = req.body;

        User.findById(req.user.id,
            (err, user) =>
            {
                if(err) 
                {
                    res.redirect("/login");
                }
                else 
                {
                    user.phoneNumber = phoneNumber;
                    user.shippingAddress = shippingAddress;

                    user.save();

                    req.flash("success", `Welcome to Dyokara, ${user.username}!`);
                    res.redirect("/products");
                }
            }
        )
    }
)

//Edit details

router.get("/login/details/edit", middleware.isLoggedIn,
    (req, res) =>
    {
        res.render("user/detailsEdit");
    }
)

//Update details

router.put("/login/details/edit", middleware.isLoggedIn,
    (req, res) =>
    {
        const {phoneNumber, shippingAddress} = req.body;

        User.findById(req.user.id,
            (err, user) =>
            {
                if(err) 
                {
                    res.redirect("/login");
                }
                else 
                {
                    user.phoneNumber = phoneNumber;
                    user.shippingAddress = shippingAddress;
                    user.save();

                    res.redirect("/products");
                }
            }
        )
    }
)

//Logout

router.get("/logout",
    (req, res) =>
    {
        req.logout();
        res.redirect("/");
    }
)

module.exports = router;