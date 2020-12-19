const express = require("express");
const multer  = require('multer');

//Models
const Product = require("../models/Product.js");

const router = express.Router();

//Image upload

const {storage} = require("../cloudinary");
const middleware = require("../middleware");
const User = require("../models/User.js");
const upload = multer({storage});

//Index

router.get("/", 
    (req, res) =>
    {	
        Product.find({},
            async(err, products) =>
            {
                if(err)
                {
                    req.flash("error", "Products not found!");
                    res.redirect("/");
                }
                else
                {
                    let productList = [];

                    products.sort(middleware.compareValues("Model Number"));

                    const finalProductNumber = parseInt(products[products.length - 1].productNumber);
                    
                    for(let index = 1; index <= finalProductNumber; index++) 
                    {
                        const modelNumber = parseInt(`${index}11`);

                        await Product.findOne({modelNumber: modelNumber},
                            async(err, foundProduct) =>
                            {
                                if(err)
                                {
                                    req.flash("error", "Products not found!");
                                    res.redirect("/");
                                }
                                else
                                {
                                    if(foundProduct)
                                    {
                                        await productList.push(foundProduct);
                                    }
                                }
                            }    
                        )
                    }

                    res.render("product/index",{products: productList});
                }
            }
        );
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
        res.render("product/new");
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
        product.modelNumber = parseInt(productModel.modelNumber);
        product.category = productModel.category;
        product.specifications["Dimensions"] = productModel.dimensions;
        product.specifications["Finish"] = productModel.finish;
        product.specifications["Mounting Mechanism"] = productModel.mount;
        product.specifications["Type of wood"] = productModel.wood;
        product.specifications["Shape"] = productModel.shape;
        product.specifications["Weight (in kg)"] = productModel.weight;

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
                else
                {
                    const productNumber = foundProduct["Product Number"];

                    Product.find({"Product Number": productNumber},
                        (err, productList) =>
                        {
                            if(err)
                            {
                                res.send("Error");
                            }

                            else
                            {
                                productList.sort(middleware.compareValues("Model Number"));

                                const sizeList = [];
                                const colourList = [];

                                //Last product in the last, model number has total no of sizes and colours

                                const finalModelNumber = `${productList[productList.length - 1].modelNumber}`;

                                const noOfColours = parseInt(finalModelNumber[finalModelNumber.length - 1]);
                                const noOfSizes = parseInt(finalModelNumber[finalModelNumber.length - 2]);

                                //Getting the list of unique sizes

                                for(let index = 0; index < productList.length; index += noOfColours) 
                                {
                                    sizeList.push(productList[index].size);
                                }

                                //Getting the list of unique colours

                                for(let index = 0; index < noOfColours; index++) 
                                {
                                    colourList.push(productList[index].colour);
                                }

                                const modelNumber = `${foundProduct.modelNumber}`;
                                
                                const colourNumber = parseInt(modelNumber[modelNumber.length - 1]); //Extracting last digit
                                const sizeNumber = parseInt(modelNumber[modelNumber.length - 2]);

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

                                                res.render("product/show", {product: foundProduct, images: images, sizeList: sizeList, colourList: colourList, sizeNumber: sizeNumber, colourNumber: colourNumber, hasBoughtProduct: hasBoughtProduct});
                                            }
                                        }
                                    )
                                }

                                else
                                {
                                    res.render("product/show", {product: foundProduct, images: images, sizeList: sizeList, colourList: colourList, sizeNumber: sizeNumber, colourNumber: colourNumber, hasBoughtProduct: hasBoughtProduct});
                                }
                            }
                        }
                    );
                }
            }
        );
    }
)

//Reroute to variation

router.get("/models/:modelNumber",
    (req, res) =>
    {
        const modelNo = parseInt(req.params.modelNumber);

        Product.findOne({modelNumber: modelNo},
            (err, foundProduct) =>
            {
                if(err)
                {
                    res.send("Error!");
                }
                else
                {
                    res.redirect("/products/" + foundProduct._id);
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
                else
                {
                    res.render("product/edit", {product: foundProduct});
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
                else
                {
                    foundProduct.name = name;
                    foundProduct.price = price;
                    foundProduct.description = description;

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
				else
				{
                    const quantity = req.body.quantity;
                    const item = 
                    {
                        product: product, 
                        quantity: quantity
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