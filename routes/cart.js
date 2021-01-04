const express = require("express");

const Product = require("../models/Product.js");
const User = require("../models/User.js");

const middleware = require("../middleware");

const router = express.Router({mergeParams: true}); 

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
        const customisation = parseInt(req.body.customisation);

        Product.findById(req.params.product_id,
			(err, foundProduct) =>
			{
				if(err)
				{
					console.log(err);
				}
				else if(foundProduct && foundProduct.stock.equals("Yes"))
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
                                    const {product, cartCustomisation} = user.cart[i];
                                    if(product.equals(foundProduct._id) && customisation.equals(cartCustomisation))
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
                                    const newItem = {quantity: quantity, customisation: customisation, product: foundProduct._id};
                                    user.cart.push(newItem);
                                }
                                user.save();
                                res.redirect(`/users/${req.params.id}/cart`);
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
                    for(let i = 0; i < user.cart.length; i++)
                    {
                        user.cart.pop();
                    }

                    let orderWeight = 0, deliveryCharge = 0, total = 0;
                    order.forEach(item => 
                        {
                            orderWeight += parseFloat(item.product.specifications["Weight (in kg)"]) * item.quantity;
                            total += item.product.price * item.quantity;
                        }
                    );

                    deliveryCharge = Math.ceil(orderWeight) * 50;
                    total += deliveryCharge;

                    user.currentOrder.items = order;
                    user.currentOrder.total = total;

                    user.save();
                    res.render("user/checkout", {order: order, deliveryCharge: deliveryCharge, total: total});
                }
            }   
        );
    }
)

//Authorization function

// const isAuthorized = (req, res, next) =>
// {
// 	if(req.isAuthenticated())
// 	{
// 		review.findById(req.params.review_id,
// 			function(err, foundreview)
// 			{
// 				if(err)
// 				{
// 					res.redirect("back");
// 				}
// 				else
// 				{
// 					if(foundreview.author.id.equals(req.user.id))
// 					{
// 						return next();
// 					}
// 					else
// 					{
// 						res.redirect("back");
// 					}
// 				}
// 			}
// 		)
// 	}
// 	else
// 	{
// 		res.redirect("back");
// 	}
// }

module.exports = router;