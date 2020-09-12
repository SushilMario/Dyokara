const express = require("express");

const Product = require("../models/Product.js");
const User = require("../models/User.js");

const middleware = require("../middleware");

const router = express.Router({mergeParams: true}); 

//Index

router.get("/", middleware.isLoggedIn,
    (req, res) =>
    {
        res.render("user/cart");
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
                                for(let i = 0; i < user.cart.length; i++)
                                {
                                    const {product} = user.cart[i];
                                    if(product._id === foundProduct._id)
                                    {
                                        index = i;
                                    }
                                }
                                if(index >= 0)
                                {
                                    user.cart.product.quantity += 1;
                                }
                                else
                                {
                                    user.cart.product.push(product);
                                    user.cart.product.quantity = quantity;
                                }
                                user.save();
                                res.redirect(`/users/${req.params.id}/cart`);
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
                                user.cart.product.quantity = quantity;
                                user.save();
                                res.redirect(`/users/${req.params.id}/cart`);
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
                            for(let i = 0; i < user.cart.length; i++)
                            {
                                const {product} = user.cart[i];
                                if(product._id === foundProduct._id)
                                {
                                    index = i;
                                }
                            }
                            if(index >= 0)
                            {
                                user.cart.splice(index,1);
                                user.save();
                            }
                            res.redirect(`/users/${req.params.id}/cart`);
                        }
                    )
                }
            }   
        )
})

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