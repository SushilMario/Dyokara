const express = require("express"),
   nodemailer = require("nodemailer"),
       sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
        const {phoneNumber} = req.body;
        const {shippingAddress} = req.body;

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
                    user.shippingAddress = shippingAddress;
                    user.save();

                    res.redirect("/payments/gpay");
                }
            }
        )
    }
)

router.put("/edit/directTransfer", middleware.isLoggedIn,
    (req, res) =>
    {
        const {bankAccountNo} = req.body;
        const {shippingAddress} = req.body;

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
                    user.shippingAddress = shippingAddress;
                    user.save();

                    res.redirect("/payments/directTransfer");
                }
            }
        )
    }
)

//Create new order

router.get("/:mode", middleware.isLoggedIn,
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
                        const productFullLine = [];
                        const productIDs = [];
                        let orderNumber = 0;

                        let total = 0;

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
                                            const {product, quantity} = item;
                                            const {name, price, colour, size, _id} = product;

                                            let productLine = `${name} (${colour}) (${size}) - ${price} X ${quantity} = ${price * quantity}`;
                                            productFullLine.push(productLine);

                                            productIDs.push(_id);
                                        }
                                    );

                                    newOrder.total = user.currentOrder.total;

                                    newOrder.orderNumber = middleware.stringify(currentOrderNumber, 8);

                                    newOrder.productIDs = productIDs;

                                    Order.create(newOrder,
                                        (err, order) =>
                                        {
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {
                                                let transporter = nodemailer.createTransport(
                                                    {
                                                        host: "http://dyokara.herokuapp.com",
                                                        service: 'smtp.gmail.com',
                                                        port: 465,
                                                        secure: "false",
                                                        auth:  
                                                        {
                                                            user: process.env.EMAIL,
                                                            pass: process.env.PASSWORD
                                                        }
                                                    }
                                                )

                                                const orderDetails = productFullLine.join("\n");
                                                const details = 
                                                `Bill Amount: Rs ${user.currentOrder.total}\nMobile Number: ${user.phoneNumber}\nShipping Address: ${user.shippingAddress}\n\nOrder :-\n\n${orderDetails}
                                                `;

                                                const mailOptions = 
                                                {
                                                    from: `${process.env.EMAIL}`,
                                                    to: `${process.env.EMAIL}`,
                                                    subject: `Order ${order.orderNumber}`,
                                                    text: details
                                                };

                                                // sgMail
                                                // .send(mailOptions)
                                                // .then(() => 
                                                //     {
                                                //         console.log('Email sent');
                                                //     }
                                                // )
                                                // .catch((error) => 
                                                //     {
                                                //         console.error(error);
                                                //     }
                                                // )

                                                transporter.sendMail(mailOptions, 
                                                    (err, data) =>
                                                    {
                                                        if(err)
                                                        {
                                                            console.log(err);
                                                        }

                                                        console.log(data);
                                                    }
                                                );

                                                res.redirect(`/payments/modes/${req.params.mode}`);
                                            }
                                        }    
                                    );

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

//Payment modes

router.get("/modes/gpay",
    (req, res) =>
    {
        res.render("order/gpay");
    }
)

router.get("/modes/directTransfer",
    (req, res) =>
    {
        const bankAccountName = "Paul Abraham";
        const bankName = "State Bank of India, Kolencherry";

        res.render("order/directTransfer", {bankAccountName: bankAccountName, bankName: bankName, bankAccountNo: process.env.BANK_ACCOUNT_NUMBER, IFSC: process.env.IFSC});
    }
)

module.exports = router;