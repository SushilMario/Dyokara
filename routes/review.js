const express = require("express");

let Product = require("../models/Product");


const middleware = require("../middleware");

const router = express.Router({mergeParams: true}); 

//New 

router.get("/new", middleware.isLoggedIn,
	(req, res) =>
	{
		//Find product
		Product.findById(req.params.id,
			(err, product) =>
			{
				if(err)
				{
					console.log(err);
				}
				else
				{
					res.render("reviews/new", {product: product});
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
		Product.findById(req.params.id,
			(err, product) =>
			{
				if(err)
				{
					console.log(err);
					res.redirect("back");
				}
				else
				{
					//Create the review
					Review.create(req.body.review,
						(err, review) =>
						{
							//Add the username and id
							review.author.id = req.user._id;
                            review.author.username = req.user.username;
                            
							//Save this to the database
							review.save();
							product.reviews.push(review);
							product.save();
							res.redirect("/products/" + product._id);
						}
					)
				}
			}
		);
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
					console.log(err);
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