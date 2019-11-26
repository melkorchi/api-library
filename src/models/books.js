// import mongoose, { Schema } from "mongoose";
const mongoose = require("mongoose");
const autoIncrement = require('mongoose-auto-increment');
const connection = mongoose.createConnection("mongodb://localhost:27017/librarytest", { useNewUrlParser: true, useUnifiedTopology: true });
const stringQuery = require("mongoose-string-query");

autoIncrement.initialize(connection);

// Majuscule
let BookSchema = new mongoose.Schema({
    title: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
        index: true
    },
    author: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    publishedDate: {
        type: Date,
        required: true
    },
    urlImage: {
        type: String,
        require: false
    },
    rating: [{
        rate: {
            type: Number,
            required: true
        },
        comment: {
            type: String,
            trim: true,
            required: false
        },
        userId: {
            type: String,
            required: true
        },
        commentPublicationDate: {
            type: Date,
            required: false
        }
    }],
    links: [{
        name: {
            type: String,
            required: false,
            default: "Amazon"
        },
        link: {
            type: String,
            required: false,
            default: "https://www.amazon.fr/"
        }
    }]
}, { timestamps: true });

BookSchema.plugin(autoIncrement.plugin, {
    model: 'Book',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});
BookSchema.plugin(stringQuery);

// Implémentation d'un middleware mongoose
BookSchema.pre("save", function(next) {
    // const book = this;
    // console.log(book.isNew);
    // if (!book.isNew) return "Something went wrong !";
    next();
});

module.exports = mongoose.model('Books', BookSchema);