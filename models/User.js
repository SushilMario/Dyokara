// var mongoose = require("mongoose"),
// 
const        passport = require("passport"),
passportLocalMongoose = require("passport-local-mongoose"),
             mongoose = require("mongoose");

let UserSchema = new mongoose.Schema
(
    {
        username: String,
        password: String,
        isAdmin:
        {
            type: Boolean,
            default: false
        },
        cart:
        [
            {
                product:
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product"
                },
                quantity:
                {
                    type: Number,
                    default: 1
                }
            }
        ],
		wishlist:
        [
            {
                product:
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product"
                },
                quantity:
                {
                    type: Number,
                    default: 1
                }
            }
        ]
    }
);

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
