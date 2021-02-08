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

//Index - Archive

router.get("/archive", middleware.isAdmin,
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
                    const sortedOrders = orders.sort(middleware.compareValues("orderNumber", "desc"));
                    res.render("order/indexArchive",{orders: sortedOrders});
                }
            }
        );
    }
);

//Show 

router.get("/:id", middleware.isAdmin,
    (req, res) =>
    {
        Order.findById(req.params.id).populate(
                {
                    path: 'customer items',
                    populate: 
                    {
                        path: 'product'
                    }
                }
            ).exec
            (
                (err, order) =>
                {
                    if(err)
                    {
                        console.log(err);
                        res.redirect("/orders");
                    }

                    else if(order)
                    {
                        const shippingAddress = 
                        `${order.customer.address.line1}, ${order.customer.address.line2}, ${order.customer.address.city}, ${order.customer.address.state}, ${order.customer.address.pinCode}`

                        res.render("order/show", {order: order, shippingAddress: shippingAddress});
                    }

                    else
                    {
                        req.flash("error", "This order does not exist");
                        res.redirect("/orders");
                    }
                }
        )
    }
)

//Update Payment

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
                    order.confirmed = true;
                    await order.save();

                    User.findById(order.customer,
                        async(err, user) =>
                        {
                            if(err)
                            {
                                console.log("User not found");
                            }
                            else
                            {
                                user.orderHistory.push(order);
                                await user.save();

                                res.redirect("/orders");
                            }
                        }    
                    );
                }
            }    
        );
    }
);

//Update Delivery

router.put("/:id/delivery", middleware.isAdmin,
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
                    order.delivered = true;
                    await order.save();

                    User.findById(order.customer,
                        async(err, user) =>
                        {
                            if(err)
                            {
                                console.log("User not found");
                            }
                            else
                            {
                                const {orderHistory} = user;

                                for(let i = 0; i < orderHistory.length; i++)
                                {
                                    if(order._id.equals(orderHistory[i]._id))
                                    {
                                        orderHistory[i] = order;
                                    }
                                }
                                await user.save();

                                res.redirect("/orders/archive");
                            }
                        }    
                    );
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