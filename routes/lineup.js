const express = require("express");

//Models

const User = require("../models/User.js");
const Tracking = require("../models/Tracking.js");

const Category = require("../models/Category.js");
const Line_up = require("../models/Line_up.js");
const Product = require("../models/Product.js");

const router = express.Router();
const middleware = require("../middleware");

//Create 

router.post("/", middleware.isAdmin,
    (req, res) =>
    {
        const lineupModel = req.body.lineup;

        const lineup = {};

        lineup.name = lineupModel.name;
        lineup.lineupNumber = parseInt(lineupModel.lineupNumber);
        lineup.category = lineupModel.category;

        Tracking.findOne({name: "primary"}, 
            async(err, track) =>
            {
                if(err)
                {
                    res.send("Error! Please try again!");
                }
                else
                {
                    track.currentLineupNumber += 1;

                    await track.save();

                    Category.findOne({name: lineup.category}, 
                        (err, foundCategory) =>
                        {
                            if(err)
                            {
                                res.send("Error!");
                            }
                            else if(foundCategory)
                            {
                                lineup.categoryID = foundCategory._id;

                                Line_up.create(lineup, 
                                    async(err, newLineup) =>
                                    {
                                        if(err)
                                        {
                                            res.send("Error!");
                                        }
                                        else
                                        {
                                            foundCategory.lineups.push(newLineup);

                                            await foundCategory.save();

                                            res.redirect(`/categories/${newLineup.categoryID}`);
                                        }
                                    }     
                                )
                            }
                            else
                            {
                                req.flash("error", "Category not found");
                                res.redirect("/categories/");
                            }
                        }     
                    )
                }
            }
        )
    }
)

//Show 

router.get("/:id",
    (req, res) =>
    {
        Line_up.findById(req.params.id).populate("products").exec
        (
            (err, foundLineup) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else if(foundLineup)
                {
                    const products = foundLineup.products.sort(middleware.compareValues("productNumber"));
                    res.render("lineup/show", {lineup: foundLineup, products: products});
                }
                else
                {
                    req.flash("error", "Lineup does not exist");
                    res.redirect(`/categories/${foundLineup.categoryID}`);
                }
            }
        );
    }
)

//Edit

router.get("/:id/edit", middleware.isAdmin,
    (req, res) =>
    {
        Line_up.findById(req.params.id,
            (err, foundLineup) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else if(foundLineup)
                {
                    res.render("lineup/edit", {lineup: foundLineup});
                }
                else
                {
                    req.flash("error", "Lineup does not exist");
                    res.redirect(`/categories/${foundLineup.categoryID}`);
                }
            }
        )
    }
)

//Update

router.put("/:id", middleware.isAdmin,
    (req, res) =>
    {
        const {name} = req.body.lineup;

        Line_up.findById(req.params.id,
            async(err, foundLineup) =>
            {
                if(err)
                {
                    res.send(err);
                    res.redirect("/lineups/" + req.params.id + "/edit");
                }
                else if(foundLineup)
                {
                    foundLineup.name = name;

                    await foundLineup.save();

                    res.redirect(`/categories/${foundLineup.categoryID}`);
                }
                else
                {
                    req.flash("error", "Line_up does not exist");
                    res.redirect(`/categories/${foundLineup.categoryID}`);
                }
            }    
        );
    }
)

//Edit production

router.get("/:id/edit/production", middleware.isAdmin,
    (req, res) =>
    {
        Line_up.findById(req.params.id,
            (err, foundLineup) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else if(foundLineup)
                {
                    res.render("lineup/editProduction", {lineup: foundLineup});
                }
                else
                {
                    req.flash("error", "Lineup does not exist");
                    res.redirect(`/categories/${foundLineup.categoryID}`);
                }
            }
        )
    }
)

//Update

router.put("/:id/edit/production", middleware.isAdmin,
    (req, res) =>
    {
        const {production} = req.body.lineup;

        Line_up.findById(req.params.id,
            (err, foundLineup) =>
            {
                if(err)
                {
                    res.send(err);
                    res.redirect("/lineups/" + req.params.id + "/edit");
                }
                else if(foundLineup)
                {
                    Product.find({lineupNumber: foundLineup.lineupNumber},
                        (err, products) =>
                        {
                            if(err)
                            { 
                                res.redirect("/lineups/" + req.params.id + "/edit");
                            }
                            else if(products)
                            {
                                if(production === "Yes")
                                {
                                    products.forEach
                                    (
                                        async product =>
                                        {
                                            product.production = production;
                
                                            await product.save();
                                        }
                                    )
                                }

                                else if(production === "No")
                                {
                                    products.forEach
                                    (
                                        async product =>
                                        {
                                            product.production = production;
                                            product.stock = "No";
                
                                            await product.save();
                                        }
                                    )
                                }
                                

                                res.redirect(`/categories/${foundLineup.categoryID}`);
                            }
                            else
                            {
                                req.flash("error", "No products found!");
                                res.redirect(`/categories/${foundLineup.categoryID}`);
                            }
                        }    
                    )
                }
                else
                {
                    req.flash("error", "Line_up does not exist");
                    res.redirect(`/categories/${foundLineup.categoryID}`);
                }
            }    
        )
    }
)

//New Product

router.get("/:id/products/new", middleware.isAdmin,
    (req, res) =>
    {
        Line_up.findById(req.params.id,
            (err, foundLineup) =>
            {
                if(err)
                {
                    res.redirect("/lineups/" + req.params.id);
                }
                else if(foundLineup)
                {
                    if(foundLineup.products.length > 0)
                    {
                        Product.findOne({lineupNumber: foundLineup.lineupNumber, sizeNumber: 1, colourNumber: 1},
                            async(err, product) =>
                            {
                                if(err)
                                { 
                                    res.redirect("/lineups/" + req.params.id);
                                }
                                else if(product)
                                {
                                    res.render("product/newOther", {product: product});
                                }
                                else
                                {
                                    req.flash("error", "First product not found!");
                                    res.redirect("/lineups/" + req.params.id);
                                }
                            }    
                        )
                    }

                    else
                    {
                        res.render("product/newFirst", {lineup: foundLineup});
                    }
                }
                else
                {
                    req.flash("error", "Lineup doesn't exist");
                    res.redirect("/lineups/" + req.params.id);
                }
            }    
        )
    }
)

module.exports = router;