const Users = require('../models/users');
const env = require("../environnement");
const jwt = require("jsonwebtoken");
const { validationResult } = require('express-validator');
// const bcrypt = require("mongoose-bcrypt");
const bcrypt = require("bcrypt");
const qs = require('qs');
const moment = require('moment');

// Register
exports.createUserMek = (req, res) => {
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

exports.createUser = async(req, res) => {
    const { password, email, name, avatar, role } = req.body;
    // Express-validator
    if (!email || !password) {
        //Le cas où l'email ou bien le password ne serait pas soumit ou nul
        return res.status(400).json({ text: "Bad Request" });
    }

    const salt = bcrypt.genSaltSync(10);
    const newUser = {
        email: email,
        password: bcrypt.hashSync(password, salt),
        name: name,
        avatar: avatar,
        role: role,
        tokens: [{
            token: jwt.sign({ email: email }, env.jwt, { expiresIn: '72h' })
        }]
    };
    // Check if user exists in DB
    try {
        const findUser = await Users.findOne({ email });
        console.log(findUser);
        if (findUser)
            return res.status(400).json({
                code: 400,
                message: "User already exists"
            });

        try {
            const user = await new Users(newUser).save();
            return res.status(200).json({
                code: 200,
                message: "User created",
                user: user
            });
        } catch (error) {
            return res.status(500).json({ error });
        }

    } catch (error) {
        return res.status(500).json({ error });
    }
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

exports.loginMek = async(req, res) => {
    try {
        let user = await Users.findOne({ email: req.body.email }).exec();
        console.log(user);
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

exports.login = async(req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Bad Request" });
    }
    try {
        // On check si l'utilisateur existe en base
        const user = await Users.findOne({ email });
        if (!user)
        // Idem ci-dessous
        // return res.status(401).json({ message: "User doesn't exist" });
            return res.status(401).json({ message: "Email or password invalid" });

        if (!bcrypt.compareSync(req.body.password, user.password))
        // Message à changer donne une information password wrong !!! Email or password invalid
        // return res.status(401).json({ message: "Invalid Password" });
            return res.status(401).json({ message: "Email or password invalid" });

        getToken(res, user);
    } catch (error) {
        return res.status(500).json({ error });
    }
}

exports.search = async(req, res) => {
    const query = req.query;

    await Users.apiQuery(query).select("id name email avatar").then(users => {
        res.status(201).json(users)
    }).catch(err => {
        res.status(500).json(err)
    });
}

exports.searchUserByToken = async(req, res) => {
    const token = req.params.token;
    console.log(token)
    try {
        let user = await Users.find({ "tokens.token": token });
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ error });
    }
}



exports.searchUsers = async(req, res) => {
    const params = qs.parse(req.query);
    // const params = req.query;

    const email = params.email;
    const userId = params.userId;
    let createdAt = params.createdAt;
    let users = [];
    const changeDateFormat = (inputDate) => { // expects d/m/y
        var splitDate = inputDate.split('/');
        if (splitDate.count == 0) {
            return null;
        }

        var year = splitDate[2];
        var month = splitDate[1];
        var day = splitDate[0];

        return month + '/' + day + '/' + year;
        // return year + '/' + month + '/' + day;
    }

    try {
        if (!email) {
            users = await Users.find();
        } else {
            if (moment(changeDateFormat(createdAt)).isValid()) {
                // const date = moment(changeDateFormat(publishedDate)).utc().format("MM/DD/YYYY");
                const date = moment(changeDateFormat(createdAt)).utc().format("MM/DD/YYYY");
                console.log('moment', date);
                console.log(changeDateFormat(createdAt));
                console.log('publishedDate Date', new Date(date));
                console.log('publishedDate Date +1', new Date(date).addDays(1));
                console.log('publishedDate Date +2', new Date(date).addDays(2));

                users = await Users.find({
                    "createdAt": {
                        "$gte": new Date(date),
                        "$lt": new Date(date).addDays(2)
                    }
                });
            } else if (Number.isInteger(parseInt(userId))) {
                users = await Users.find({ id: parseInt(userId) });
            } else {
                // console.log('string');
                users = await Users.find({ email: email });
            }
        }

        return (users.length < 1) ? sendJson(res, 402, "0 résultat trouvé") : sendJson(res, 200, users);
    } catch (err) {
        return sendJson(res, 500, err);
    }
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
    // return res.status(200).send({ auth: true, name: user.name, email: user.email, token: token });
    return res.status(200).send({ auth: true, id: user.id, token: token });
}