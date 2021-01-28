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
    req.flash("error", "You must be logged in to do that");
	res.redirect("/login");
}

middlewareObj.isAdmin = function(req, res, next) 
{
    if (req.isAuthenticated()) 
    {
        const userId = req.user.id;

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
                        req.flash("error", "You aren't authorized to do that!");
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

//Sorting function
middlewareObj.compareValues = function(key, order = 'asc') 
{
    return function innerSort(a, b) 
    {
        const varA = (typeof a[key] === 'string')
        ? a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string')
        ? b[key].toUpperCase() : b[key];

        let comparison = 0;
        if (varA > varB)
        {
            comparison = 1;
        } 
        else if (varA < varB) 
        {
            comparison = -1;
        }
        return (
            (order === 'desc') ? (comparison * -1) : comparison
        );
    };
}

//Stringify number
middlewareObj.stringify = function(num, len)
{
    let stringifiedNum = `${num}`;
    for(let i = stringifiedNum.length; i < len; i++)
    {
        stringifiedNum = "0" + stringifiedNum;
    }
    
    return stringifiedNum;
}

//Can review product
middlewareObj.canReview = (req, res, next) =>
{
    let checker = false;
    const userId = req.user.id;

    User.findById(req.user.id).populate("orderHistory").exec(
        (err, foundUser) =>
        {
            if(err)
            {
                res.send("Error!");
            }
            else
            {
                const productID = req.params.id;
                
                for(let order of foundUser.orderHistory)
                {
                    for(let id of order.productIDs)
                    {
                        if(id.equals(productID))
                        {
                            checker = true;
                            break;
                        } 
                    }
                }

                if(checker)
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

//Calculate delivery rate

middlewareObj.calculateDeliveryRate = (pinCode, orderWeight) =>
{
    const statePin = `${pinCode[0]}${pinCode[1]}`;

    if(statePin === "67" || statePin === "68" || statePin === "69")
    {
        return (50 + ((orderWeight - 1) * 50));
    }

    else
    {
        return (80 + ((orderWeight - 1) * 60));
    }
}

module.exports = middlewareObj;