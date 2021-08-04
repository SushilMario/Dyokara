const express = require("express");
const moment = require("moment");

const Product = require("../models/Product.js");
const User = require("../models/User.js");

const middleware = require("../middleware");

const router = express.Router({mergeParams: true}); 

moment().format();

//Index

router.get("/", middleware.isLoggedIn,
    (req, res) =>
    {
        User.findById(req.params.id).populate({path: "cart.product"}).exec(
            (err, user) =>
            {
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    res.render("user/cart", {cart: user.cart});
                }
            }
        );	
    }
)

//Create 

router.post("/products/:product_id", middleware.isLoggedIn,  
	(req, res) =>
	{
        const quantity = parseInt(req.body.quantity);
        const currentCustomisation = req.body.customisation;

        Product.findById(req.params.product_id,
			(err, foundProduct) =>
			{
				if(err)
				{
					console.log(err);
				}
				else if(foundProduct && foundProduct.stock === "Yes")
				{
					User.findById(req.params.id,
                        (err, user) =>
                        {
                            if(err)
                            {
                                console.log(err);
                            }
                            else
                            {
                                let index = -1;
                                for(let i = 0; i < user.cart.length; i++)
                                {
                                    const {product, customisation} = user.cart[i];
                                    if(product.equals(foundProduct._id) && (customisation === currentCustomisation))
                                    {
                                        index = i;
                                    }
                                }
                                if(index >= 0)
                                {
                                    user.cart[index].quantity += quantity;
                                }
                                else
                                {
                                    const newItem = {quantity: quantity, customisation: currentCustomisation, product: foundProduct._id};
                                    user.cart.push(newItem);
                                }
                                user.save();

                                req.flash("success", "Product added!");
                                res.redirect("back");
                            }
                        }
                    );	
                }
                else
                {
                    req.flash("error", "Product does not exist!");
                    res.redirect("/products");
                }
			}
		);
	}
)

//Update 

router.put("/products/:product_id", middleware.isLoggedIn,
	(req, res) =>
	{
        const quantity = parseInt(req.body.quantity);

        Product.findById(req.params.product_id,
			(err, foundProduct) =>
			{
				if(err)
				{
					console.log(err);
				}
				else if(foundProduct)
				{
					User.findById(req.user.id,
                        async(err, user) =>
                        {
                            if(err)
                            {
                                console.log(err);
                            }
                            else
                            {
                                let index = -1;
                                for(let i = 0; i < user.cart.length; i++)
                                {
                                    const {product} = user.cart[i];
                                    if(product.equals(foundProduct._id))
                                    {
                                        index = i;
                                    }
                                }
                                if(index >= 0)
                                {
                                    user.cart[index].quantity = quantity;
                                }
                                await user.save();
                            }
                        }
                    );	
                }
                else
                {
                    req.flash("error", "Product not found");
                    res.redirect("/products");
                }
			}
		);
	}
)

//Destroy 

router.delete("/products/:product_id", middleware.isLoggedIn,
    (req,res) =>
    {
        User.findById(req.params.id,
            (err, user) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else
                {
                    Product.findById(req.params.product_id,
                        (err, foundProduct) =>
                        {
                            if(err)
                            {
                                req.flash("error", `${err}`);
                                res.redirect("/products");
                            }
                            else if(foundProduct)
                            {
                                middleware.delete(user, "cart", foundProduct);
                                res.redirect(`/users/${req.params.id}/cart`);
                            }
                            else
                            {
                                req.flash("error", "Product not found");
                                res.redirect("/products");
                            }
                        }
                    )
                }
            }   
        );
    }
)

//Checkout

router.post("/checkout", middleware.isLoggedIn,
    (req, res) =>
    {
        User.findById(req.params.id).populate({path: "cart.product"}).exec(
            (err,user) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else
                {
                    const order = user.cart.slice();

                    let orderWeight = 0, deliveryCharge = 0, total = 0;
                    order.forEach(item => 
                        {
                            orderWeight += parseFloat(item.product.specifications["Weight (in kg)"]) * item.quantity;
                            total += item.product.price * item.quantity;
                        }
                    );

                    // deliveryCharge = middleware.calculateDeliveryRate(req.user.address.pinCode, Math.ceil(orderWeight));
                    // total += deliveryCharge;

                    user.currentOrder.items = order;
                    user.currentOrder.total = total;
                    // user.currentOrder.deliveryCharge = deliveryCharge;
                    user.currentOrder.orderDate = moment();
                    user.currentOrder.isCart = true;

                    user.save();
                    res.render("user/checkout", {order: order, total: total});
                }
            }   
        );
    }
)

module.exports = router;