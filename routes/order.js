const express = require("express");

//Models
const Product = require("../models/Product.js");
const User = require("../models/User.js");
const Order = require("../models/Order.js");
const Tracking = require("../models/Tracking.js");

const middleware = require("../middleware");

const router = express.Router();

//Index

router.get("/", middleware.isAdmin,
    (req, res) =>
    {
        Order.find({}).populate("customer").exec(
            (err, orders) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else
                {
                    res.render("order/index",{orders: orders});
                }
            }
        );
    }
);

//Update

router.put("/:id", middleware.isAdmin,
    (req, res) =>
    {
        Order.findById(req.params.id,
            async(err, order) =>
            {
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    User.findById(order.customer,
                        async(err, user) =>
                        {
                            if(err)
                            {
                                console.log("User not found");
                            }
                            else
                            {
                                user.previousOrders.push(order);
                                await user.save();
                            }
                        }    
                    );

                    order.confirmed = true;
                    await order.save();

                    res.redirect("/orders");
                }
            }    
        );
    }
);

//Destroy

router.delete("/:id", middleware.isAdmin,
    (req, res) =>
    {
        Order.findByIdAndRemove(req.params.id,
            (err, order) =>
            {
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    res.redirect("/orders");
                }
            }    
        );
    }
);

module.exports = router;