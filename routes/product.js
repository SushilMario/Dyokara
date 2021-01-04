const express = require("express");
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
const upload = multer({storage});

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
                    Product.find({sizeNumber: 1, colourNumber: 1},
                        (err, productList) =>
                        {
                            if(err)
                            {
                                res.send(err);
                            }
                            else
                            {
                                const productDisplay = [];

                                if(productList.length !== 0)
                                {
                                    track.categories.forEach
                                    (
                                        (category, index) =>
                                        {
                                            const currentCategory = 
                                            {
                                                name: category.name,
                                                byline: category.byline,
                                                products: []
                                            };

                                            productDisplay.push(currentCategory);

                                            productList.forEach
                                            (
                                                product =>
                                                {
                                                    if(product.category.equals(category.name) && product.production.equals("Yes"))
                                                    {
                                                        productDisplay[index].products.push(product);
                                                    }
                                                }
                                            )
                                        }
                                    )
                                }

                                res.render("product/index",{productDisplay: productDisplay});
                            }
                        }    
                    )
                }
            }
        )
    }
)

//Index - category

// router.get("/:category", 
//     (req, res) =>
//     {	
//         Product.find({category: req.params.category},
//             (err, foundProducts) =>
//             {
//                 if(err)
//                 {
//                     console.log(err);
//                     res.redirect("/");
//                 }
//                 else
//                 {
//                     res.render("product/index", {products: foundProducts});
//                 }
//             }
//         );
//     }
// )

//New

router.get("/new", middleware.isAdmin,
    (req, res) =>
    {
        Tracking.findOne({name: "primary"},
            (err, track) =>
            {
                if(err)
                {
                    res.send("Error! Please try again");
                }
                else
                {
                    res.render("product/new", {currentProductNumber: track.currentProductNumber});
                }
            }
        )
    }
)

//Prefill new

router.get("/preFill", middleware.isAdmin,
    (req, res) =>
    {
        const {preProductNumber} = req.body.product;

        Product.find({productNumber: preProductNumber, sizeNumber: 1, colourNumber: 1},
            (err, foundProduct) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else if(foundProduct)
                {
                    res.render("product/newPreFill", {product: foundProduct});
                }
                else
                {
                    req.flash("error", "Invalid product number!");
                    res.redirect("/products/new");
                }
            }
        )
    }
)


//Create 

router.post("/", upload.array('images', 5), middleware.isAdmin,
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
        product.noOfUnits = productModel.noOfUnits;
        product.description = productModel.description;
        product.price = parseInt(productModel.price);
        product.noOfItems = parseInt(productModel.price);
        product.productNumber = parseInt(productModel.productNumber);
        product.category = productModel.category;
        product.production = productModel.production;
        product.stock = productModel.stock;
        product.specifications["Dimensions"] = productModel.dimensions;
        product.specifications["Finish"] = productModel.finish;
        product.specifications["Mounting Mechanism"] = productModel.mount;
        product.specifications["Type of wood"] = productModel.wood;
        product.specifications["Shape"] = productModel.shape;
        product.specifications["Weight (in kg)"] = productModel.weight;

        if(product.production.equals("No"))
        {
            product.stock = "No";
        }

        const allImages = req.files;
        let images = new Array(5);
        let count = 2;

        allImages.forEach
        (
            image => 
            {
                const name = image.originalname.toLowerCase();

                if(name.includes("small"))
                {
                    images[0] = 
                    {
                        url: image.path,
                        filename: image.filename
                    }
                }

                else if(name.includes("medium"))
                {
                    images[1] = 
                    {
                        url: image.path,
                        filename: image.filename
                    }
                }

                else
                {
                    images[count] = 
                    {
                        url: image.path,
                        filename: image.filename
                    }
                    count += 1;
                }
            }
        );

        product.images = images;

        Tracking.findOne({name: "primary"}, 
            async(err, track) =>
            {
                if(err)
                {
                    res.send("Error! Please try again!");
                }
                else
                {
                    if(track.currentProductNumber < product.productNumber)
                    {
                        track.currentProductNumber += 1;
                        product.productNumber = track.currentProductNumber;

                        let categoryPresence = false;

                        track.categories.forEach
                        (
                            category =>
                            {
                                if(category.name.equals(product.category))
                                {
                                    categoryPresence = true;
                                }
                            }
                        )

                        if(!categoryPresence)
                        {
                            const newCategory = 
                            {
                                name: product.category,
                                byline: productModel.categoryByline
                            }

                            track.categories.push(newCategory);
                        }

                        await track.save();

                        product.colourNumber = product.sizeNumber = 1;

                        const lineup = 
                        {
                            productNumber: 0,
                            sizeList: [],
                            colourList: [],
                            variations: 
                            [
                                {
                                    size: "",
                                    colours: []
                                }
                            ]
                        };

                        lineup.productNumber = product.productNumber;
                        lineup.sizeList.push(product.size);
                        lineup.variations[product.sizeNumber].size = product.size;
                        lineup.variations[product.sizeNumber].colours.push(product.colour);

                        Line_up.create(lineup, 
                            (err, newLineup) =>
                            {
                                if(err)
                                {
                                    res.send("Error!");
                                }
                                else
                                {
                                    product.modelNumber = parseInt(`${product.productNumber}${product.sizeNumber}${product.colourNumber}`)

                                    Product.create
                                    (
                                        product,
                                        (err, product) =>  
                                        {
                                            if(err)
                                            {
                                                res.send("Error");
                                            }
                                            else
                                            {
                                                res.redirect("/products");
                                            }
                                        }
                                    );
                                }
                            }     
                        )
                    }
                    else
                    {
                        Line_up.findOne({productNumber: product.productNumber},
                            async(err, foundLineup) =>
                            {
                                if(err)
                                {
                                    res.send("Error!");
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
                                            res.redirect("/products");
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

                                        foundLineup.variations[foundLineup.sizeList.length - 1].size = product.size;
                                        foundLineup.variations[foundLineup.sizeList.length - 1].colours.push(product.colour);

                                        product.sizeNumber = foundLineup.sizeList.length;
                                        product.colourNumber = 1;
                                    }

                                    await foundLineup.save();

                                    Product.create
                                    (
                                        product,
                                        (err, product) =>  
                                        {
                                            if(err)
                                            {
                                                res.send("Error");
                                            }
                                            else
                                            {
                                                res.redirect("/products");
                                            }
                                        }
                                    );
                                }
                            }    
                        )
                    }
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
                    const {productNumber} = foundProduct;

                    Line_up.find({productNumber: productNumber},
                        (err, foundLineup) =>
                        {
                            if(err)
                            {
                                res.send("Error");
                            }
                            else
                            {
                                let hasBoughtProduct = false;

                                const images = [];

                                foundProduct.images.forEach((image, i) =>
                                    {
                                        if(i >= 2)
                                        {
                                            images.push(image);
                                        }
                                    }
                                )

                                if(req.user)
                                {
                                    User.findById(req.user.id).populate("previousOrders").exec(
                                        (err, foundUser) =>
                                        {
                                            if(err)
                                            {
                                                res.send("Error!");
                                            }
                                            else
                                            {
                                                for(let order of foundUser.previousOrders)
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

                                                if(foundProduct.production.equals("No"))
                                                {
                                                    if(req.user.isAdmin)
                                                    {
                                                        res.render("product/show", {product: foundProduct, images: images, lineup: foundLineup, hasBoughtProduct: hasBoughtProduct});
                                                    }
                                                    else
                                                    {
                                                        req.flash("error", "You are not authorised to do that");
                                                        res.redirect("/products");
                                                    }
                                                }

                                                else
                                                {
                                                    res.render("product/show", {product: foundProduct, images: images, lineup: foundLineup, hasBoughtProduct: hasBoughtProduct});
                                                }
                                            }
                                        }
                                    )
                                }

                                else
                                {
                                    if(foundProduct.production.equals("No"))
                                    {
                                        req.flash("error", "You are not authorised to do that");
                                        res.redirect("/products");
                                    }

                                    else
                                    {
                                        res.render("product/show", {product: foundProduct, images: images, lineup: foundLineup, hasBoughtProduct: hasBoughtProduct});
                                    }
                                    
                                }
                            }
                        }
                    );
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

//Reroute to variation

router.get("/models/:modelNumber",
    (req, res) =>
    {
        const modelNumber = parseInt(req.params.modelNumber);

        const {productNumber, sizeNumber} = req.body.product;

        Product.findOne({modelNumber: modelNumber},
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
                    Product.findOne({productNumber: productNumber, sizeNumber: sizeNumber, colourNumber: 1},
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
        const {name, price, description} = req.body.product;
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
                    foundProduct.name = name;
                    foundProduct.price = price;
                    foundProduct.description = description;
                    foundProduct.production = production;
                    foundProduct.stock = stock;

                    if(foundProduct.production.equals("No"))
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
				else if(product && product.stock.equals("Yes"))
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

                    const deliveryCharge = Math.ceil(orderWeight) * quantity * 50;

                    const total = (item.product.price * quantity)  + deliveryCharge;

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
                                user.save();
                            }
                        }    
                    )

					res.render("user/checkout", {order: order, deliveryCharge: deliveryCharge, total: total});	
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