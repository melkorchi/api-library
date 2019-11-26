const mongoose = require("mongoose");
const stringQuery = require("mongoose-string-query");
const autoIncrement = require('mongoose-auto-increment');
const connection = mongoose.createConnection("mongodb://localhost:27017/librarytest", { useNewUrlParser: true, useUnifiedTopology: true });

autoIncrement.initialize(connection);

// Majuscule
let LogsSchema = new mongoose.Schema({
    ip: {
        type: String,
        lowercase: true,
        required: true,
        index: true
    },
    location: {
        latitude: {
            type: Number,
            required: false
        },
        longitude: {
            type: Number,
            required: false
        }
    },
    userId: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
}, { timestamps: true });

LogsSchema.plugin(stringQuery);
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