const mongoose = require("mongoose");
const bcrypt = require("mongoose-bcrypt");
const stringQuery = require("mongoose-string-query");
const autoIncrement = require('mongoose-auto-increment');
const connection = mongoose.createConnection("mongodb://localhost:27017/library", { useNewUrlParser: true, useUnifiedTopology: true });

autoIncrement.initialize(connection);

// Majuscule
let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        unique: true
    },
    password: {
        type: String,
        trim: true,
        // bcrypt: true,
        require: true
    },
    name: {
        type: String,
        trim: true,
        require: false
    },
    avatar: {
        type: String,
        trim: true,
        require: false,
        default: "Anonyme"
    },
    role: {
        type: String,
        default: "ROLE_USER"
    },
    tokens: [{
        token: {
            type: String,
            trim: true
        },
        type: {
            type: String,
            require: true,
            default: "auth"
        }
    }]
}, { timestamps: true });

// Liason de bcrypt
// UserSchema.plugin(bcrypt, {
//     fields: ['password'],
//     rounds: 10
// });
UserSchema.plugin(stringQuery);
UserSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});

// Implémentation d'un middleware mongoose
// Vérifie si l'utilisateur qui va être crée existe déjà
UserSchema.pre("save", function(next) {
    // if (!this.isNew) next();
    // else {
    //     console.log("Envoi du mail");
    // Utiliser promesse
    next();
});

module.exports = mongoose.model('Users', UserSchema);