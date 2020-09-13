const express = require("express");

const Product = require("../models/Product.js");
const User = require("../models/User.js");

const middleware = require("../middleware");

const router = express.Router({mergeParams: true}); 

//Index

router.get("/", middleware.isLoggedIn,
    (req, res) =>
    {
        User.findById(req.params.id).populate({path: "wishlist.product"}).exec(
            (err, user) =>
            {
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    res.render("user/wishlist", {wishlist: user.wishlist});
                }
            }
        );	
    }
)

//Create 

router.post("/products/:product_id",  
	(req, res) =>
	{
        const quantity = req.body.quantity;
        Product.findById(req.params.product_id,
			(err, foundProduct) =>
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
                                let index = -1;
                                for(let i = 0; i < user.wishlist.length; i++)
                                {
                                    const {product} = user.wishlist[i];
                                    if(product.equals(foundProduct._id))
                                    {
                                        index = i;
                                    }
                                }
                                if(index >= 0)
                                {
                                    user.wishlist[index].quantity += 1;
                                }
                                else
                                {
                                    const newItem = {quantity: quantity, product: foundProduct._id};
                                    user.wishlist.push(newItem);
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
                                let index = -1;
                                for(let i = 0; i < user.wishlist.length; i++)
                                {
                                    const {product} = user.wishlist[i];
                                    if(product.equals(foundProduct._id))
                                    {
                                        index = i;
                                    }
                                }
                                if(index >= 0)
                                {
                                    user.wishlist[index].quantity = quantity;
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
                    Product.findById(req.params.product_id,
                        (err,foundProduct) =>
                        {
                            for(let i = 0; i < user.wishlist.length; i++)
                            {
                                const {product} = user.wishlist[i];
                                if(product.equals(foundProduct._id))
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

//Add to wishlist

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
                    Product.findById(req.params.product_id,
                        (err,foundProduct) =>
                        {
                            for(let i = 0; i < user.wishlist.length; i++)
                            {
                                const {product} = user.wishlist[i];
                                if(product.equals(foundProduct._id))
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
                            res.redirect(`/users/${req.params.id}/wishlist`);
                        }
                    )
                }
            }   
        )
    }
)

module.exports = router;