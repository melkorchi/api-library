const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const stringQuery = require("mongoose-string-query");
const autoIncrement = require('mongoose-auto-increment');
const nodeMailer = require('nodemailer');
const connection = mongoose.createConnection("mongodb://localhost:27017/librarytest", { useNewUrlParser: true, useUnifiedTopology: true });

autoIncrement.initialize(connection);

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
    isSoftDeleted: {
        type: Boolean,
        default: false
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

UserSchema.plugin(stringQuery);
UserSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});

UserSchema.pre('save', async function(next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next()
})

UserSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this;
    const token = jwt.sign({ _id: user._id }, 'MekIbnMek20192020', { expiresIn: '24h' });
    // const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY);
    user.tokens = user.tokens.concat({ token });

    await user.save().catch((err) => console.log('caught it save'));
    return token;
}

UserSchema.statics.sendMail = async(email, password) => {}

UserSchema.statics.findByCredentials = async(email, password) => {
    const user = await Users.findOne({ email });
    if (!user) {
        throw new Error({ error: 'Invalid login credentials' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' });
    }

    return user;
}

const Users = mongoose.model('Users', UserSchema)

// module.exports = mongoose.model('Users', UserSchema);
module.exports = Users;