const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
    {
        routeName: {
            type: String,
            required: true,
            trim: true
        },

        startPoint: {
            type: String,
            required: true,
            trim: true
        },

        endPoint: {
            type: String,
            required: true,
            trim: true
        },

        stops: [
            {
                name: {
                    type: String,
                    required: true
                },

                latitude: {
                    type: Number,
                    required: true
                },

                longitude: {
                    type: Number,
                    required: true
                }
            }
        ],

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Route", routeSchema);