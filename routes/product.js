const express = require("express");
const moment = require("moment");
const multer  = require('multer');

//Models
const Product = require("../models/Product.js");

const router = express.Router();

//Image upload

const {storage} = require("../cloudinary");
const middleware = require("../middleware");
const User = require("../models/User.js");
const Tracking = require("../models/Tracking.js");
const Line_up = require("../models/Line_up.js");
const Category = require("../models/Category.js");

const upload = multer({storage});

moment().format();

//Index

router.get("/", 
    (req, res) =>
    {	
        Tracking.findOne({name: "primary"},
            (err, track) =>
            {
                if(err)
                {
                    res.send(err);
                }
                else
                {
                    Category.find({}).populate("products").exec
                    (
                        (err, categories) =>
                        {
                            if(err)
                            {
                                res.send(err);
                            }
                            else if(categories)
                            {
                                for(let i = 0; i < categories.length; i++)
                                {
                                    categories[i].products = categories[i].products.sort(middleware.compareValues("lineupNumber"));
                                }

                                res.render("product/index", {categories: categories, announcement: track.announcement});
                            }
                        }    
                    )
                }
            }
        )
    }
)

//Index - Category

router.get("/categories/:category", 
    (req, res) =>
    {	
        Tracking.findOne({name: "primary"},
            (err, track) =>
            {
                if(err)
                {
                    res.send(err);
                }
                else
                {
                    Category.find({},
                        (err, categories) =>
                        {
                            if(err)
                            {
                                res.send(err);
                            }
                            else if(categories)
                            {
                                Category.findOne({name: req.params.category}).populate("products").exec
                                (
                                    (err, foundCategory) =>
                                    {
                                        if(err)
                                        {
                                            res.send(err);
                                        }
                                        else if(foundCategory)
                                        {
                                            foundCategory.products = foundCategory.products.sort(middleware.compareValues("lineupNumber"));

                                            res.render("product/indexCategory", {categories: categories, foundCategory: foundCategory, announcement: track.announcement});
                                        }
                                        else
                                        {
                                            req.flash("error", "Category does not exist");
                                            res.redirect("/products");
                                        }
                                    }    
                                )
                            }
                        }    
                    )
                }
            }
        )
    }
)

//Create 

router.post("/", upload.array('images'), middleware.isAdmin,
    (req, res) =>
    {
        const productModel = req.body.product;

        const product = 
        {
            specifications: {},
            images: []
        };

        product.name = productModel.name;
        product.colour = productModel.colour;
        product.size = productModel.size;
        product.description = productModel.description;
        product.price = parseInt(productModel.price);
        product.noOfUnits = parseInt(productModel.noOfUnits);
        product.lineupNumber = parseInt(productModel.lineupNumber);
        product.category = productModel.category;
        product.production = productModel.production;
        product.stock = productModel.stock;
        product.specifications["Dimensions"] = productModel.dimensions;
        product.specifications["Finish"] = productModel.finish;
        product.specifications["Mounting Mechanism"] = productModel.mount;
        product.specifications["Type of wood"] = productModel.wood;
        product.specifications["Shape"] = productModel.shape;
        product.specifications["Weight (in kg)"] = productModel.weight;

        if(product.production === "No")
        {
            product.stock = "No";
        }

        const allImages = req.files;
        let images = [];

        allImages.forEach
        (
            (image) => 
            {
                images.push
                (
                    {
                        url: image.path,
                        filename: image.filename
                    }
                );
            }
        );

        product.images = images;

        Line_up.findOne({lineupNumber: product.lineupNumber}, 
            async(err, foundLineup) =>
            {
                if(err)
                {
                    res.send("Error! Please try again!");
                }
                else
                {
                    if(foundLineup.sizeList.length === 0)
                    {
                        product.colourNumber = product.sizeNumber = 1;

                        foundLineup.sizeList.push(product.size);

                        foundLineup.variations[0] = 
                        {
                            size: product.size,
                            colours: []
                        }
                        foundLineup.variations[0].colours.push(product.colour);
                    }

                    else
                    {
                        const sizeCheck = foundLineup.sizeList.indexOf(product.size);

                        if(sizeCheck > -1)
                        {
                            product.sizeNumber = sizeCheck + 1;

                            const {colours} = foundLineup.variations[sizeCheck];

                            const colourCheck = colours.indexOf(product.colour);

                            if(colourCheck > -1)
                            {
                                req.flash("error", "Cannot create duplicate product!");
                                res.redirect(`/lineups/${foundLineup._id}`);
                            }

                            else
                            {
                                foundLineup.variations[sizeCheck].colours.push(product.colour);
                                product.colourNumber = foundLineup.variations[sizeCheck].colours.length;
                            }
                        }

                        else
                        {
                            foundLineup.sizeList.push(product.size);

                            foundLineup.variations[foundLineup.sizeList.length - 1] = 
                            {
                                size: product.size,
                                colours: []
                            }
                            foundLineup.variations[foundLineup.sizeList.length - 1].colours.push(product.colour);

                            product.sizeNumber = foundLineup.sizeList.length;
                            product.colourNumber = 1;
                        }
                    }

                    product.productNumber = `${product.lineupNumber}${product.sizeNumber}${product.colourNumber}`;

                    Product.create
                    (
                        product,
                        async(err, product) =>  
                        {
                            if(err)
                            {
                                res.send("Error");
                            }
                            else if(product)
                            {
                                foundLineup.products.push(product);

                                await foundLineup.save();

                                if(product.sizeNumber == 1 && product.colourNumber === 1)
                                {
                                    Category.findOne({name: product.category},
                                        async(err, foundCategory) =>
                                        {
                                            if(err)
                                            {
                                                res.send(err);
                                            }
                                            else if(foundCategory)
                                            {
                                                foundCategory.products.push(product);

                                                await foundCategory.save();

                                                res.redirect(`/lineups/${foundLineup._id}`);
                                            }
                                        }    
                                    )
                                }

                                else
                                {
                                    res.redirect(`/lineups/${foundLineup._id}`);
                                }
                            }
                        }
                    );
                }
            }
        )
    }
)

//Show 

router.get("/:id",
    (req, res) =>
    {
        Product.findById(req.params.id).populate("reviews").exec
        (
            (err, foundProduct) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else if(foundProduct)
                {
                    Line_up.findOne({lineupNumber: foundProduct.lineupNumber},
                        (err, lineup) =>
                        {
                            if(err)
                            {
                                res.send(err);
                            }
                            else if(lineup)
                            {
                                let hasBoughtProduct = false;
                                let hasReviewedProduct = false;

                                if(req.user)
                                {
                                    User.findById(req.user.id).populate("orderHistory").exec(
                                        (err, foundUser) =>
                                        {
                                            if(err)
                                            {
                                                res.send("Error!");
                                            }
                                            else
                                            {
                                                //Has bought product?

                                                for(let order of foundUser.orderHistory)
                                                {
                                                    for(let id of order.productIDs)
                                                    {
                                                        if(id.equals(foundProduct._id))
                                                        {
                                                            hasBoughtProduct = true;
                                                            break;
                                                        } 
                                                    }
                                                }

                                                //Has reviewed product?

                                                for(let review of foundProduct.reviews)
                                                {
                                                    if(foundUser._id.equals(review.author.id))
                                                    {
                                                        hasReviewedProduct = true;
                                                        break;
                                                    } 
                                                }

                                                if(foundProduct.production === "No")
                                                {
                                                    if(req.user.isAdmin)
                                                    {
                                                        res.render("product/show", {lineup: lineup, product: foundProduct, hasBoughtProduct: hasBoughtProduct, hasReviewedProduct: hasReviewedProduct});
                                                    }
                                                    else
                                                    {
                                                        req.flash("error", "Sorry, this item has been discontinued");
                                                        res.redirect("back");
                                                    }
                                                }

                                                else
                                                {
                                                    res.render("product/show", {lineup: lineup, product: foundProduct, hasBoughtProduct: hasBoughtProduct, hasReviewedProduct: hasReviewedProduct});
                                                }
                                            }
                                        }
                                    )
                                }

                                else
                                {
                                    if(foundProduct.production === "No")
                                    {
                                        req.flash("error", "Sorry, this item has been discontinued");
                                        res.redirect("back");
                                    }

                                    else
                                    {
                                        res.render("product/show", {lineup: lineup, product: foundProduct, hasBoughtProduct: hasBoughtProduct, hasReviewedProduct: hasReviewedProduct});
                                    }
                                    
                                }
                            }
                        }    
                    )
                }
                
                else
                {
                    req.flash("error", "Product does not exist");
                    res.redirect("back");
                }
            }
        );
    }
)

//Reroute to variation

router.get("/variations/:lineupNumber/:productNumber/:sizeNumber",
    (req, res) =>
    {
        const lineupNumber = parseInt(req.params.lineupNumber);
        const productNumber = parseInt(req.params.productNumber);
        const sizeNumber = parseInt(req.params.sizeNumber);

        Product.findOne({productNumber: productNumber},
            (err, foundProduct) =>
            {
                if(err)
                {
                    res.send("Error!");
                }
                else if(foundProduct)
                {
                    res.redirect("/products/" + foundProduct._id);
                }
                else
                {
                    Product.findOne({lineupNumber: lineupNumber, sizeNumber: sizeNumber, colourNumber: 1},
                        (err, backupProduct) =>
                        {
                            if(err)
                            {
                                res.send(err);
                            }
                            else if(backupProduct)
                            {
                                res.redirect("/products/" + backupProduct._id);
                            }
                            else
                            {
                                req.flash("error", "Product does not exist");
                                res.redirect("/products");
                            }
                        }    
                    )
                }
            }
        )
    }
)

//Notification List

router.put("/:id/notify", middleware.isLoggedIn,
    (req, res) =>
    {
        Product.findById(req.params.id,
            async(err, foundProduct) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else if(foundProduct)
                {
                    if(foundProduct.stock === "Yes")
                    {
                        req.flash("error", "Product is in stock");
                        res.redirect(`/products/${foundProduct._id}`);
                    }

                    else
                    {
                        const notificationList = [];
                        notificationList.push(req.user.id);

                        foundProduct.notificationList = notificationList;
                        await foundProduct.save();

                        res.redirect(`/products/${foundProduct._id}`);
                    }
                }
                else
                {
                    req.flash("error", "Product does not exist");
                    res.redirect("/products/new");
                }
            }
        )
    }
)

//Edit

router.get("/:id/edit", middleware.isAdmin,
    (req, res) =>
    {
        Product.findById(req.params.id,
            (err, foundProduct) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else if(foundProduct)
                {
                    res.render("product/edit", {product: foundProduct});
                }
                else
                {
                    req.flash("error", "Product does not exist");
                    res.redirect("/products/new");
                }
            }
        )
    }
)

//Update

router.put("/:id", middleware.isAdmin,
    (req, res) =>
    {
        const product = req.body.product;
        Product.findById(req.params.id,
            (err, foundProduct) =>
            {
                if(err)
                {
                    console.log(err);
                    res.redirect("/products/" + req.params.id + "/edit");
                }
                else if(foundProduct)
                {
                    foundProduct.name = product.name;
                    foundProduct.description = product.description;
                    foundProduct.price = parseInt(product.price);
                    foundProduct.noOfUnits = parseInt(product.noOfUnits);
                    foundProduct.specifications["Dimensions"] = product.dimensions;
                    foundProduct.specifications["Finish"] = product.finish;
                    foundProduct.specifications["Mounting Mechanism"] = product.mount;
                    foundProduct.specifications["Type of wood"] = product.wood;
                    foundProduct.specifications["Shape"] = product.shape;
                    foundProduct.specifications["Weight (in kg)"] = product.weight;

                    if(foundProduct.stock === "No" && product.stock === "Yes")
                    {
                        if(foundProduct.notificationList.length > 0)
                        {
                            foundProduct.notificationList = [];
                        }
                    }

                    foundProduct.production = product.production;
                    foundProduct.stock = product.stock;

                    if(foundProduct.production === "No")
                    {
                        foundProduct.stock = "No";
                    }

                    Product.findByIdAndUpdate(req.params.id, foundProduct, 
                        (err, updatedProduct) =>
                        {
                            if(err)
                            {
                                req.flash("error", "Product couldn't be updated");
                                res.redirect(`/products/${req.params.id}/edit`);
                            }
                            else
                            {
                                req.flash("success", "Product successfully updated!");
                                res.redirect(`/products/${req.params.id}`);
                            }
                        }
                    )
                }
                else
                {
                    req.flash("error", "Product does not exist");
                    res.redirect("/products/new");
                }
            }    
        );
    }
)

//Checkout

router.post("/:id/checkout", middleware.isLoggedIn,
    (req,res) =>
    {
        Product.findById(req.params.id,
			(err, product) =>
			{
				if(err)
				{
					console.log(err);
				}
				else if(product && product.stock === "Yes")
				{
                    const quantity = req.body.quantity;
                    const customisation = req.body.customisation;
                    const item = 
                    {
                        product: product, 
                        quantity: quantity,
                        customisation: customisation
                    };
                    const order = [];
                    order.push(item);
                    
                    const orderWeight = parseFloat(item.product.specifications["Weight (in kg)"]);

                    // const deliveryCharge = middleware.calculateDeliveryRate(req.user.address.pinCode, Math.ceil(orderWeight));

                    // const total = (item.product.price * quantity)  + deliveryCharge;

                    const total = item.product.price * quantity;

                    User.findById(req.user._id,
                        (err, user) =>
                        {
                            if(err)
                            {
                                req.flash("Error! Please try again");
                                res.redirect("back");
                            }
                            else
                            {
                                user.currentOrder.items = order;
                                user.currentOrder.total = total;
                                // user.currentOrder.deliveryCharge = deliveryCharge;
                                user.currentOrder.orderDate = moment();
                                user.save();
                            }
                        }    
                    )

					res.render("user/checkout", {order: order, total: total});	
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

//Confirm destroy

router.get("/:id/confirm", middleware.isAdmin,
    (req, res) =>
    {
        res.render("product/deleteConfirm", {id: req.params.id});
    }
)

//Destroy

router.delete("/:id", middleware.isAdmin,
    (req, res) =>
    {
        Product.findByIdAndRemove(req.params.id,
            (err) =>
            {
                if(err)
                {
                    req.flash("error", "Product couldn't be deleted");
                    res.redirect(`/products/${req.params.id}`);
                }
                else
                {
                    req.flash("success", "Product successfully removed!");
                    res.redirect("/products");
                }
            }    
        )
    }
)

module.exports = router;