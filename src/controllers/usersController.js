const Users = require('../models/users');
const env = require("../environnement");
const jwt = require("jsonwebtoken");
const { validationResult } = require('express-validator');
// const bcrypt = require("mongoose-bcrypt");
const bcrypt = require("bcrypt");

// Register
exports.createUser = (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return sendJson(res, 422, errors.array());
    // }

    let data = (req.body.email === undefined) ? {
        email: "mek-" + Math.floor(Math.random() * 1000) + "@gmail.com",
        pasword: "qsdf",
        name: "testor"
    } : req.body;

    let salt = bcrypt.genSaltSync(10);
    data.password = bcrypt.hashSync(data.password, salt)

    data.tokens = [{
        token: jwt.sign({ email: data.email }, env.jwt, { expiresIn: '72h' })
    }]

    Users.create(data).then(user => {
        // res.status(201).json(user);
        getToken(res, user);
    }).catch(err => {
        res.status(500).json(err);
    });
}



exports.allUsers = async(req, res) => {
    try {
        const users = await Users.find();
        return (users.length > 0) ? sendJson(res, 200, users) : sendJson(res, 402, "Collection users is empty");
    } catch (err) {
        return sendJson(res, 500, err);
    }
}

// Search
exports.listUsers = (req, res) => {
    const query = req.query;

    Users.apiQuery(query).select("id name email avatar").then(user => {
        res.status(201).json(user)
    }).catch(
        err => res.status(500).json(err)
    );
}

// Retrieve
exports.viewUser = async(req, res) => {
    try {
        const user = await Users.find({ id: req.params.id });
        return (user.length < 1) ? sendJson(res, 402, "user not found") : sendJson(res, 200, user);
    } catch (err) {
        return sendJson(res, 500, err);
    }
}

// Update (cas ou user not found)
exports.updateUser = async(req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return sendJson(res, 422, errors.array());
    // }
    const updateUser = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        avatar: req.body.avatar,
        role: req.body.role
    }

    try {
        const book = await Users.findOneAndUpdate({ id: req.params.id }, updateUser, { new: true });
        sendJson(res, 200, "Updated");
    } catch (err) {
        sendJson(res, 500, err);
    }
}

// Delete
// exports.removeUser = (req, res) => {
//     Users.findOneAndDelete({ _id: req.params.id }, function(err, user) {
//         return err ? sendJson(res, 501, err) : (user == null) ? sendJson(res, 402, "user not found") : sendJson(res, 200, "user removed");
//     });
// }

// Remove a book (manage not user not found)
exports.removeUser = async(req, res) => {
    try {
        await Users.findOneAndDelete({ id: req.params.id });
        sendJson(res, 200, "User removed");
    } catch (err) {
        sendJson(res, 500, err);
    }
}

// Remove all books
exports.removeAllUsers = async(req, res) => {
    try {
        await Users.deleteMany();
        sendJson(res, 200, "Collection users cleared");
    } catch (err) {
        sendJson(res, 500, err);
    }
}

exports.login = async(req, res) => {
    try {
        console.log(req.body);
        let user = await Users.findOne({ email: req.body.email }).exec();

        if (!user) sendJson(res, 400, "User doesn't exist");
        try {
            if (!bcrypt.compareSync(req.body.password, user.password)) sendJson(res, 400, "Invalid Password");
        } catch (error) {
            res.status(500).send({ message: "BCrypt trouble" })
        }
        // sendJson(res, 200, user);
        getToken(res, user);
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.search = async(req, res) => {
    const query = req.query;

    await Users.apiQuery(query).select("id name email avatar").then(log => {
        res.status(201).json(log)
    }).catch(
        err => res.status(500).json(err)
    );
}

const sendJson = (res, code = 200, data = "") => {
    res.status(code);
    // Rappel code 200 OK et code 201 Created
    if (code === 200 || code === 201) {
        return res.json({
            err: false,
            httpCode: code,
            users: data
        })
    }
    return res.json({
        err: true,
        httpCode: code,
        messageErr: data
    })
}

const getToken = (res, user) => {
    let token = jwt.sign({ email: user.email }, env.jwt, { expiresIn: '72h' });
    // return res.status(200).send({ auth: true, name: user.name, email: user.email, role: user.role, token: token });
    return res.status(200).send({ auth: true, name: user.name, email: user.email, token: token });
}