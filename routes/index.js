const express = require("express"),
     passport = require("passport");

const middleware = require("../middleware");

const User = require("../models/User.js");
const Product = require("../models/Product.js");

const router = express.Router();

//Home 

router.get("/",
    (req, res) => 
    {
        if(req.isAuthenticated())
        {
            res.redirect("/products");
        }

        else
        {
            res.render("landing");
        }
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
            scope: [ 'email', 'profile' ]
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
        const {phoneNumber, address} = req.body;
        const {line1, line2, city, state, pinCode} = address;

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
                    user.address.line1 = line1;
                    user.address.line2 = line2;
                    user.address.city = city;
                    user.address.state = state;
                    user.address.pinCode = pinCode;

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
        const {phoneNumber, address} = req.body;
        const {line1, line2, city, state, pinCode} = address;

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
                    user.address.line1 = line1;
                    user.address.line2 = line2;
                    user.address.city = city;
                    user.address.state = state;
                    user.address.pinCode = pinCode;

                    user.save();

                    res.redirect("/products");
                }
            }
        )
    }
)

//Previous orders

router.get("/previousOrders", middleware.isLoggedIn,
    (req, res) =>
    {
        User.findById(req.user.id).populate(
            {
                path: 'previousOrders',
                populate: 
                {
                    path: 'items',
                    populate: 
                    {
                        path: 'product'
                    }
                }
            }
        ).exec
        (
            (err, user) =>
            {
                if(err) 
                {
                    res.send(err);
                }
            
                else if(user)
                {
                    const orders = user.previousOrders.sort(middleware.compareValues("orderNumber", "desc"));
                    res.render("user/previousOrders", {orders: orders});
                }

                else
                {
                    req.flash("error", "User doesn't exist");
                    res.redirect("/products");
                }
            }
        )
    }
)

//Notification Product List

router.get("/notify/products", middleware.isAdmin,
    (req, res) =>
    {
        Product.find({stock: "No"},
            (err, products) =>
            {
                if(err) 
                {
                    res.send(err);
                }
            
                else
                {
                    const productList = products.sort(middleware.compareValues("productNumber"));

                    res.render("user/notificationProductList", {products: productList});
                }
            }
        )
    }
)

//Notification User List

router.get("/notify/products/:id/users", middleware.isAdmin,
    (req, res) =>
    {
        Product.findById(req.params.id).populate("notificationList").exec
        (
            (err, foundProduct) =>
            {
                if(err) 
                {
                    res.send(err);
                }
            
                else if(foundProduct)
                {
                    res.render("user/notificationUserList", {product: foundProduct, notificationList: foundProduct.notificationList});
                }

                else
                {
                    req.flash("error", "Product doesn't exist");
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