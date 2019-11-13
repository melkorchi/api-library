const mongoose = require("mongoose");
const stringQuery = require("mongoose-string-query");
const autoIncrement = require('mongoose-auto-increment');
// const connection = mongoose.createConnection("mongodb://localhost:27017/library");
const env = require("../environnement");
const connection = mongoose.createConnection(env.bdd.mongo.url);

autoIncrement.initialize(connection);

// Majuscule
let LogsSchema = new mongoose.Schema({
    ip: {
        type: String,
        lowercase: true,
        required: true,
        index: true,
        unique: true
    },
    location: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    userId: {
        type: Number,
        required: true
    },
    // user: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // },
    date: {
        type: Date,
        required: true
    }
}, { timestamps: true });

LogsSchema.plugin(autoIncrement.plugin, {
    model: 'Log',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});

LogsSchema.pre("save", function(next) {
    next();
});

module.exports = mongoose.model('Logs', LogsSchema);