const express = require("express");

//Models
let Product = require("../models/Product.js");

const middleware = require("../middleware");

const router = express.Router();

//Index

router.get("/", 
    (req, res) =>
    {	
        Product.find({},
            (err, products) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else
                {
                    res.render("product/index",{products: products});
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

router.get("/new",
    (req, res) =>
    {
        res.render("product/new");
    }
)

//Create 

router.post("/",
    (req, res) =>
    {
        Product.create({name: req.body.name, image: req.body.image, shortDesc: req.body.shortDesc, longDesc: req.body.longDesc, price: req.body.price, specifications: req.body.specifications},
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
                    res.render("product/show",{product: foundProduct});
                }
            }
        );
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
                    Product.findByIdAndUpdate(req.params.id, foundProduct,
                        (err, updatedProduct) =>
                        {
                            if(err)
                            {
                                console.log(err);
                                res.redirect("/products/" + req.params.id + "/edit");
                            }
                            else
                            {
                                res.redirect("/products");
                            }
                        }
                    )
                }
            }    
        );
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
                    console.log(err);
                }
                else
                {
                    res.redirect("/products");
                }
            }    
        )
    }
)

module.exports = router;