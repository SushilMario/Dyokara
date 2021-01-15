const express = require("express");

//Models

const User = require("../models/User.js");
const Tracking = require("../models/Tracking.js");

const Category = require("../models/Category.js");
const Line_up = require("../models/Line_up.js");
const Product = require("../models/Product.js");

const router = express.Router();
const middleware = require("../middleware");

//Index

router.get("/", middleware.isAdmin, 
    (req, res) =>
    {	
        Category.find({},
            (err, categories) =>
            {
                if(err)
                {
                    res.send(err);
                }
                else
                {
                    res.render("category/index",{categories: categories});
                }
            }    
        )
    }
)

//New

router.get("/new", middleware.isAdmin,
    (req, res) =>
    {
        res.render("category/new");
    }
)

//Create 

router.post("/", middleware.isAdmin,
    (req, res) =>
    {
        const categoryModel = req.body.category;

        const category = {};

        category.name = categoryModel.name;
        category.byline = categoryModel.byline;

        Category.create(category, 
            (err, newCategory) =>
            {
                if(err)
                {
                    res.send("Error!");
                }
                else
                {
                    res.redirect("/categories");
                }
            }     
        )
    }
)

//Show 

router.get("/:id", middleware.isAdmin,
    (req, res) =>
    {
        Category.findById(req.params.id).populate("lineups").exec
        (
            (err, foundCategory) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else if(foundCategory)
                {
                    const lineups = foundCategory.lineups.sort(middleware.compareValues("lineupNumber"));
                    res.render("category/show", {category: foundCategory, lineups: lineups});
                }
                else
                {
                    req.flash("error", "Category does not exist");
                    res.redirect("/categories");
                }
            }
        );
    }
)

//Edit

router.get("/:id/edit", middleware.isAdmin,
    (req, res) =>
    {
        Category.findById(req.params.id,
            (err, foundCategory) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else if(foundCategory)
                {
                    res.render("category/edit", {category: foundCategory});
                }
                else
                {
                    req.flash("error", "category does not exist");
                    res.redirect("/categories");
                }
            }
        )
    }
)

//Update

router.put("/:id", middleware.isAdmin,
    (req, res) =>
    {
        const {byline} = req.body.category;

        Category.findById(req.params.id,
            async(err, foundCategory) =>
            {
                if(err)
                {
                    res.send(err);
                    res.redirect("/categories/" + req.params.id + "/edit");
                }
                else if(foundCategory)
                {
                    foundCategory.byline = byline;

                    await foundCategory.save();

                    res.redirect("/categories/");
                }
                else
                {
                    req.flash("error", "Category does not exist");
                    res.redirect("/categories/");
                }
            }    
        );
    }
)

//New Lineup

router.get("/:id/lineups/new", middleware.isAdmin,
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
                    Category.findById(req.params.id,
                        (err, foundCategory) =>
                        {
                            if(err)
                            {
                                res.redirect("/categories/" + req.params.id);
                            }
                            else if(foundCategory)
                            {
                                res.render("lineup/new", {category: foundCategory, currentLineupNumber: track.currentLineupNumber});
                            }
                            else
                            {
                                req.flash("error", "Category doesn't exist");
                                res.redirect("/categories/" + req.params.id);
                            }
                        }    
                    )
                }
            }
        )
    }
)

module.exports = router;