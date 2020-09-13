const User = require("../models/User");
const Review = require("../models/Review");

const middlewareObj = {};

middlewareObj.isLoggedIn = 
(req, res, next) =>
{
	if(req.isAuthenticated())
	{
		return next();
	}
	res.redirect("/login");
}

middlewareObj.isAdmin = function(req, res, next) 
{
    if (req.isAuthenticated()) 
    {
        const userId = req.user._id;

        User.findById(userId,
            (err, user) =>
            {
                if(err) 
                {
                    console.log(err);
                    res.redirect("/");
                }
                else 
                {
                    if(user.isAdmin) 
                    {
                        return next();
                    }
                    else 
                    {
                        res.redirect("back");
                    }
                }
            }
        )
    }
    else 
    {
        res.redirect("/");
    }
}

middlewareObj.isReviewOwner = 
(req, res, next) =>
{
	if(req.isAuthenticated())
	{
		Review.findById(req.params.review_id,
			(err, foundReview) =>
			{
				if(err)
				{
					res.redirect("back");
				}
				else
				{
					if(!foundReview)
					{
						res.redirect("back");
					}
					if(foundReview.author.id.equals(req.user.id))
					{
						return next();
					}
					else
					{
						res.redirect("back");
					}
				}
			}
		)
	}
	else
	{
		res.redirect("back");
	}
}

//Delete function
middlewareObj.delete = 
(user, group, foundProduct) =>
{
    let index = -1;
    for(let i = 0; i < user[group].length; i++)
    {
        const {product} = user[group][i];
        if(product.equals(foundProduct._id))
        {
            index = i;
        }
    }
    if(index >= 0)
    {
        user[group].splice(index,1);
        user.save();
    }
}

module.exports = middlewareObj;