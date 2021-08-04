const express = require("express");

//Models
const Product = require("../models/Product.js");
const User = require("../models/User.js");
const Order = require("../models/Order.js");
const Tracking = require("../models/Tracking.js");

const middleware = require("../middleware");

const router = express.Router();

//Edit payment details

router.get("/edit/gpay", middleware.isLoggedIn,
    (req, res) =>
    {
        res.render("payment/gpayEdit");
    }
)

router.get("/edit/directTransfer", middleware.isLoggedIn,
    (req, res) =>
    {
        res.render("payment/directEdit");
    }
)

//Update payment details

router.put("/edit/gpay", middleware.isLoggedIn,
    (req, res) =>
    {
        const {phoneNumber, address} = req.body;
        const {line1, line2, city, state, pinCode} = address;

        User.findById(req.user.id,
            (err, user) =>
            {
                if(err) 
                {
                    res.redirect("back");
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

                    res.redirect("/payments");
                }
            }
        )
    }
)

router.put("/edit/directTransfer", middleware.isLoggedIn,
    (req, res) =>
    {
        const {bankAccountNo, address} = req.body;
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
                    user.bankAccountNo = bankAccountNo;
                    user.address.line1 = line1;
                    user.address.line2 = line2;
                    user.address.city = city;
                    user.address.state = state;
                    user.address.pinCode = pinCode;

                    user.save();

                    res.redirect("/payments/directTransfer");
                }
            }
        )
    }
)

//Create new order

router.get("/", middleware.isLoggedIn,
    (req, res) =>
    {
        User.findById(req.user._id).populate({path: "currentOrder.items.product"}).exec(
            (err, user) =>
            {
                if(err)
                {
                    console.log("User not found");
                }
                else
                { 
                    if(user.currentOrder)
                    {
                        const newOrder = {};
                        const productIDs = [];
                        let currentItem = {};
                        const items = [];

                        // Generation of a new 8 digit order number
                    
                        Tracking.findOne({name: "primary"},
                            async(err, track) =>
                            {
                                if(err)
                                {
                                    req.flash("error", "Error! Please try again!");
                                    res.redirect("back");
                                }
                                else
                                {
                                    const {currentOrderNumber} = track;

                                    newOrder.customer = user._id; 

                                    user.currentOrder.items.forEach(item => 
                                        {
                                            const {product, quantity, customisation} = item;
                                            const {name, price, colour, size, _id} = product;

                                            productIDs.push(_id);

                                            currentItem.product = _id;
                                            currentItem.quantity = quantity;
                                            currentItem.customisation = customisation;
                                            currentItem.purchasePrice = price * quantity;

                                            items.push(currentItem);
                                        }
                                    );

                                    newOrder.total = user.currentOrder.total;

                                    newOrder.deliveryCharge = user.currentOrder.deliveryCharge;

                                    newOrder.orderDate = user.currentOrder.orderDate;

                                    newOrder.orderNumber = middleware.stringify(currentOrderNumber, 8);

                                    newOrder.productIDs = productIDs;

                                    newOrder.items = items;

                                    Order.create(newOrder,
                                        (err, order) =>
                                        {
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {
                                                res.redirect(`/payments/confirmation`);
                                            }
                                        }    
                                    )

                                    track.currentOrderNumber += 1;
                                    await track.save();
                                }
                            }
                        );
                    }
                    else
                    {
                        req.flash("error", "No items to checkout!");
                        res.redirect("/products");
                    }
                }   
            }
        );
    }
)

// router.get("/:mode", middleware.isLoggedIn,
//     (req, res) =>
//     {
//         User.findById(req.user._id).populate({path: "currentOrder.items.product"}).exec(
//             (err, user) =>
//             {
//                 if(err)
//                 {
//                     console.log("User not found");
//                 }
//                 else
//                 { 
//                     if(req.params.mode !== "gpay" && req.params.mode !== "directTransfer")
//                     {
//                         req.flash("error", "Invalid payment option");
//                         res.redirect("/products");
//                     }

//                     if(user.currentOrder)
//                     {
//                         const newOrder = {};
//                         const productIDs = [];
//                         let currentItem = {};
//                         const items = [];

//                         // Generation of a new 8 digit order number
                    
//                         Tracking.findOne({name: "primary"},
//                             async(err, track) =>
//                             {
//                                 if(err)
//                                 {
//                                     req.flash("error", "Error! Please try again!");
//                                     res.redirect("back");
//                                 }
//                                 else
//                                 {
//                                     const {currentOrderNumber} = track;

//                                     newOrder.customer = user._id; 

//                                     user.currentOrder.items.forEach(item => 
//                                         {
//                                             const {product, quantity, customisation} = item;
//                                             const {name, price, colour, size, _id} = product;

//                                             productIDs.push(_id);

//                                             currentItem.product = _id;
//                                             currentItem.quantity = quantity;
//                                             currentItem.customisation = customisation;
//                                             currentItem.purchasePrice = price * quantity;

//                                             items.push(currentItem);
//                                         }
//                                     );

//                                     newOrder.total = user.currentOrder.total;

//                                     newOrder.deliveryCharge = user.currentOrder.deliveryCharge;

//                                     newOrder.orderDate = user.currentOrder.orderDate;

//                                     newOrder.orderNumber = middleware.stringify(currentOrderNumber, 8);

//                                     newOrder.productIDs = productIDs;

//                                     newOrder.items = items;

//                                     Order.create(newOrder,
//                                         (err, order) =>
//                                         {
//                                             if(err)
//                                             {
//                                                 console.log(err);
//                                             }
//                                             else
//                                             {
//                                                 res.redirect(`/payments/modes/${req.params.mode}`);
//                                             }
//                                         }    
//                                     )

//                                     track.currentOrderNumber += 1;
//                                     await track.save();
//                                 }
//                             }
//                         );
//                     }
//                     else
//                     {
//                         req.flash("error", "No items to checkout!");
//                         res.redirect("/products");
//                     }
//                 }   
//             }
//         );
//     }
// )

// Confirmation of order 

router.get("/confirmation", middleware.isLoggedIn,
    (req, res) =>
    {
        User.findById(req.user.id,
            async(err, user) =>
            {
                if(err)
                {
                    res.send(err);
                }
                else 
                {
                    const {cart} = user;

                    if(user.currentOrder.isCart)
                    {
                        const noOfItems = cart.length;

                        for(let i = 0; i < noOfItems; i++)
                        {
                            cart.pop();
                        }
                    }

                    await user.save();
                    
                    res.render("order/confirmation", {total: user.currentOrder.total, number: process.env.GPAY_NUMBER});
                }
            }    
        )
    }
)

//Payment modes

// router.get("/modes/gpay", middleware.isLoggedIn,
//     (req, res) =>
//     {
//         User.findById(req.user.id,
//             async(err, user) =>
//             {
//                 if(err)
//                 {
//                     res.send(err);
//                 }
//                 else 
//                 {
//                     const {cart} = user;

//                     if(user.currentOrder.isCart)
//                     {
//                         const noOfItems = cart.length;

//                         for(let i = 0; i < noOfItems; i++)
//                         {
//                             cart.pop();
//                         }
//                     }

//                     await user.save();
                    
//                     res.render("order/gpay", {total: user.currentOrder.total, number: process.env.GPAY_NUMBER});
//                 }
//             }    
//         )
//     }
// )

// router.get("/modes/directTransfer", middleware.isLoggedIn,
//     (req, res) =>
//     {
//         User.findById(req.user.id,
//             async (err, user) =>
//             {
//                 if(err)
//                 {
//                     res.send(err);
//                 }
//                 else 
//                 {
//                     const {cart} = user;

//                     if(user.currentOrder.isCart)
//                     {
//                         const noOfItems = cart.length;

//                         for(let i = 0; i < noOfItems; i++)
//                         {
//                             cart.pop();
//                         }
//                     }

//                     await user.save();

//                     const bankAccountName = "Paul Abraham";
//                     const bankName = "State Bank of India, Kolencherry";

//                     res.render("order/directTransfer", {total: user.currentOrder.total, bankAccountName: bankAccountName, bankName: bankName, bankAccountNo: process.env.BANK_ACCOUNT_NUMBER, IFSC: process.env.IFSC});
//                 }
//             }    
//         )
//     }
// )

// Payment redirect

router.get("/finish", middleware.isLoggedIn,
    (req, res) =>
    {
        req.flash("success", "Thank you for shopping with us!");
        res.redirect("/products");
    }
)

module.exports = router;