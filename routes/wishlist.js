const express = require("express");

const Product = require("../models/Product.js");
const User = require("../models/User.js");

const middleware = require("../middleware");

const router = express.Router({mergeParams: true}); 

//Index

router.get("/", middleware.isLoggedIn,
    (req, res) =>
    {
        res.render("user/wishlist");
    }
)

//Create 

router.post("/products/:product_id",  
	(req, res) =>
	{
        const quantity = req.body.quantity;
        Product.findById(req.params.product_id,
			(err, product) =>
			{
				if(err)
				{
					console.log(err);
				}
				else
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
                                for(let i = 0; i < user.wishlist.length; i++)
                                {
                                    const {product} = user.wishlist[i];
                                    if(product._id === foundProduct._id)
                                    {
                                        index = i;
                                    }
                                }
                                if(index >= 0)
                                {
                                    user.wishlist.product.quantity += 1;
                                }
                                else
                                {
                                    user.wishlist.product.push(product);
                                    user.wishlist.product.quantity = quantity;
                                }
                                user.save();
                                res.redirect(`/users/${req.params.id}/wishlist`);
                            }
                        }
                    );	
				}
			}
		);
	}
)

//Update 

router.put("/products/:product_id",
	(req, res) =>
	{
        const quantity = req.body.quantity;
        Product.findById(req.params.product_id,
			(err, product) =>
			{
				if(err)
				{
					console.log(err);
				}
				else
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
                                user.wishlist.product.quantity = quantity;
                                user.save();
                                res.redirect(`/users/${req.params.id}/wishlist`);
                            }
                        }
                    );	
				}
			}
		);
	}
)

//Destroy 

router.delete("/products/:product_id",
    (req,res) =>
    {
        User.findById(req.params.id,
            (err,user) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else
                {
                    let index = -1;
                    Product.findById(req.params.id,
                        (err,foundProduct) =>
                        {
                            for(let i = 0; i < user.wishlist.length; i++)
                            {
                                const {product} = user.wishlist[i];
                                if(product._id === foundProduct._id)
                                {
                                    index = i;
                                }
                            }
                            if(index >= 0)
                            {
                                user.wishlist.splice(index,1);
                                user.save();
                            }
                            res.redirect(`/users/${req.params.id}/wishlist`);
                        }
                    )
                }
            }   
        )
    }
)

//Add to cart

router.post("/products/:product_id/move",
    (req,res) =>
    {
        User.findById(req.params.id,
            (err,user) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else
                {
                    let index = -1;
                    Product.findById(req.params.id,
                        (err,foundProduct) =>
                        {
                            for(let i = 0; i < user.wishlist.length; i++)
                            {
                                const {product} = user.wishlist[i];
                                if(product._id === foundProduct._id)
                                {
                                    index = i;
                                }
                            }
                            if(index >= 0)
                            {
                                const shiftProductArray = user.wishlist.splice(index,1);
                                const shiftProduct = shiftProductArray[0];
                                user.cart.push(shiftProduct);
                                user.save();
                            }
                            res.redirect(`/users/${req.params.id}/cart`);
                        }
                    )
                }
            }   
        )
    }
)

module.exports = router;