// var mongoose = require("mongoose"),
// 
const   passport = require("passport"),
        mongoose = require("mongoose");

let UserSchema = new mongoose.Schema
(
    {
        username: String,
        googleId: String,
        phoneNumber: String,
        shippingAddress: String,
        bankAccountNo: String,

        isAdmin:
        {
            type: Boolean,
            default: false
        },

        currentOrder:
        {
            items:
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
                    },
                    customisation:
                    {
                        type: String,
                        default: "None"
                    }
                }
            ],
            total: Number,
            orderDate: Date
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
                },
                customisation:
                {
                    type: String,
                    default: "None"
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
                },
                customisation:
                {
                    type: String,
                    default: "None"
                }
            }
        ],

        previousOrders:
        [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order"
            }
        ]
    }
);

module.exports = mongoose.model("User", UserSchema);
