const express = require("express");

const Product = require("../models/Product");

const Review = require("../models/Review.js");

const middleware = require("../middleware");

const router = express.Router({mergeParams: true}); 

//New 

router.get("/new", middleware.isLoggedIn, middleware.canReview,
	(req, res) =>
	{
		//Find product
        Product.findById(req.params.id).populate("reviews").exec
        (
			(err, product) =>
			{
				if(err)
				{
					console.log(err);
				}
				else if(product)
				{
                    let hasReviewedProduct = false;

                    for(let review of product.reviews)
                    {
                        if(review.author.id.equals(req.user.id))
                        {
                            hasReviewedProduct = true;
                            break;
                        } 
                    }

                    if(hasReviewedProduct)
                    {
                        req.flash("error", "Multiple reviews not allowed!");
                        res.redirect("/products/" + product._id);
                    }

                    else
                    {
                        res.render("review/new", {product: product});
                    }
                }
                else
                {
                    req.flash("error", "Product does not exist");
                    res.redirect("/products");
                }
			}
		);	
	}
)

//Create route

router.post("/", middleware.isLoggedIn, 
	(req, res) =>
	{
		//Find the product
        Product.findById(req.params.id).populate("reviews").exec
        (
            (err, product) =>
            {
                if(err)
                {
                    console.log(err);
                    res.redirect("back");
                }
                else if(product)
                {
                    //Create the review
                    Review.create(req.body.review,
                        (err, review) =>
                        {
                            //Add the username and id
                            review.author.id = req.user._id;
                            review.author.username = req.user.username;

                            product.reviews.push(review);

                            let totalRating = 0, averageRating = 0.0;
                            const noOfReviews = product.reviews.length;

                            product.reviews.forEach(review => 
                                {
                                    totalRating += review.rating;
                                }
                            );

                            averageRating = Math.round((totalRating / noOfReviews) * 10) / 10;
                            product.averageRating = averageRating;
                            
                            //Save to the database
                            review.save();
                            product.save();
                            res.redirect("/products/" + product._id);
                        }
                    )
                }
                else
                {
                    req.flash("error", "Product does not exist");
                    res.redirect("/products");
                }
            }
        )
    }
)

//Edit route

// router.get("/:review_id/edit", middleware.isReviewOwner,
// 	(req, res) =>
// 	{
// 		Product.findById(req.params.id,
// 			(err, foundProduct) =>
// 			{
// 				if(err)
// 				{
// 					console.log(err);
// 					res.redirect("/products");
// 				}
// 				else
// 				{
// 					Review.findById(req.params.review_id,
// 						(err, foundReview) =>
// 						{ 
// 							console.log(err);
// 							res.render("reviews/edit", {product: foundProduct, review: foundReview});
// 						}
// 					)
// 				}
// 			}
// 		)
// 	}
// )

// //Update route

// router.put("/:review_id", middleware.isReviewOwner,
// 	(req, res) =>
// 	{
// 		Review.findByIdAndUpdate(req.params.review_id, req.body.review,
// 			(err, updatedReview) =>
// 			{
// 				if(err)
// 				{
// 					console.log(err);
// 					res.redirect("back");
// 				}
// 				else
// 				{
// 					res.redirect("/products/" + req.params.id);
// 				}
// 			}
// 		)
// 	}
// )

//Destroy route

router.delete("/:review_id", middleware.isReviewOwner,
	(req, res) =>
	{
		Review.findByIdAndRemove(req.params.review_id, 
			(err) =>
			{
				if(err)
				{
					req.flash("error", `${err}`);
					res.redirect("back");
				}
				else
				{
					res.redirect(`/products/${req.params.id}`);
				}
			}
		)
	}
)

module.exports = router;