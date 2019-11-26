const Users = require('../models/users');
const Logs = require('../models/logs');
const geoip = require('geoip-lite');
const ip = require("ip");
const env = require("../environnement");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bcryptjs = require('bcryptjs');
const qs = require('qs');
const moment = require('moment');
const nodemailer = require('nodemailer');

exports.createUser = async(req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body)

        const findUser = await Users.findOne({ email });
        if (findUser)
            return res.status(400).json({
                code: 400,
                message: "User already exists"
            });

        const mdpcrypte = await bcrypt.hash(password, 8);
        let data = {
            email: email,
            pasword: mdpcrypte
        };

        // const user = new Users(req.body);
        Users.create(data).then(user => {
            const token = jwt.sign({ email: email }, 'MekIbnMek20192020', { expiresIn: '24h' });
            user.tokens = user.tokens.concat({ token });
            user.save();
            sendJson(res, 200, user)
        }).catch(err => {
            res.status(500).json(err);
        });

        // const token = await user.generateAuthToken();

        // const transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: 'testorIMIE2019@gmail.com',
        //         pass: 'masterimie2019'
        //     }
        // });

        // const mailOptions = {
        //     from: 'testorIMIE2019@gmail.com',
        //     to: 'testorIMIE2019@gmail.com',
        //     subject: 'Création de compte chez Library',
        //     text: 'Nous vous confirmons la création d\'un compte au niveau de l\'application Library ! \n\n Username: ' + email + '\n\n Password: ' + password
        // };

        // await transporter.sendMail(mailOptions);


        // return res.status(200).json({
        //     code: 200,
        //     message: "User created",
        //     user: user,
        //     token: token
        // });

    } catch (error) {
        return res.status(400).send(error);
    }
}

exports.mdpForgot = async(req, res) => {
    const { email } = req.params;
    console.log(email)
    const findUser = await Users.findOne({ email });

    if (!findUser)
        return res.status(400).json({
            code: 400,
            message: "User doesn't exists"
        });

    const token = await findUser.generateAuthToken();
    // Envoi du mail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'testorIMIE2019@gmail.com',
            pass: 'masterimie2019'
        }
    });

    const mailOptions = {
        from: 'testorIMIE2019@gmail.com',
        to: 'testorIMIE2019@gmail.com',
        subject: 'Réinitialisation de mot de passe',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your     account.\n\n' + 'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            // 'http://' + req.headers.host + '/mdp-forgot/' + token + '\n\n' +
            'http://localhost:3000/mdp-reinit/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };

    await transporter.sendMail(mailOptions);

    sendJson(res, 200, "Email avec token envoyé");

}

exports.allUsers = async(req, res) => {
    try {
        const users = await Users.find({ isSoftDeleted: false });
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

exports.updateUserMdp = async(req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return sendJson(res, 422, errors.array());
    // }

    const { email, password } = req.body;
    const mdpcrypte = await bcrypt.hash(password, 8);

    try {
        const user = await Users.update({ email: email }, {
            $set: {
                password: mdpcrypte
            }
        });
        sendJson(res, 200, "Mot de passe réinitialiser");

        // Envoi de mail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'testorIMIE2019@gmail.com',
                pass: 'masterimie2019'
            }
        });

        const mailOptions = {
            from: 'testorIMIE2019@gmail.com',
            to: 'testorIMIE2019@gmail.com',
            subject: 'Réinitialisation de mot de passe',
            text: 'Nous vous confirmons la réinitialisation de votre mot de passe pour l\'application Library ! \n\n Username: ' + email + '\n\n Password: ' + password
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    } catch (err) {
        sendJson(res, 500, err);
    }
}

// Update (cas ou user not found)
exports.updateUser = async(req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return sendJson(res, 422, errors.array());
    // }
    if (req.body.password) {
        const password = await bcrypt.hash(req.body.password, 8);
        const updateUser = {
            email: req.body.email,
            password: password,
            name: req.body.name,
            avatar: req.body.avatar,
            role: req.body.role
        }

        try {
            const user = await Users.findOneAndUpdate({ id: req.params.id }, updateUser, { new: true });
            sendJson(res, 200, "Updated");
        } catch (err) {
            sendJson(res, 500, err);
        }
    } else {

        try {
            const user = await Users.update({ id: req.params.id }, {
                $set: {
                    email: req.body.email,
                    name: req.body.name,
                    avatar: req.body.avatar,
                    role: req.body.role
                }
            });
            sendJson(res, 200, "Updated");
        } catch (err) {
            sendJson(res, 500, err);
        }
    }

}

// Remove a book (manage not user not found)
exports.removeUser = async(req, res) => {
    try {
        await Users.findOneAndDelete({ id: req.params.id });
        sendJson(res, 200, "User removed");
    } catch (err) {
        sendJson(res, 500, err);
    }
}

exports.softRemoveUser = async(req, res) => {
    console.log(req.params)
    try {
        const user = await Users.update({ id: req.params.id }, {
            $set: {
                isSoftDeleted: true
            }
        });
        console.log('user', user);

        sendJson(res, 200, "User soft removed");
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
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "No login credentials provided" });
        }

        // findByCredentials
        const user = await Users.findOne({ email });
        if (!user) {
            // return res.status(400).json({ message: "Login failed! Check authentication credentials" });
            return res.status(400).json({ message: "Login failed !" });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            // return res.status(400).json({ message: "Login failed! Check authentication credentials" });
            return res.status(400).json({ message: "Login failed !" });
        }

        const token = await user.generateAuthToken();

        // Créer un log
        const myIp = ip.address();
        console.log('mon ip', myIp);
        // What's my ip 91.161.240.34
        const ipUser = '91.161.240.34';
        // const geo = geoip.lookup(myIp);
        const geo = geoip.lookup(ipUser);
        console.log('geo', geo);

        const newLog = {
            ip: ipUser,
            location: {
                latitude: (geo) ? geo.ll[0] : null,
                longitude: (geo) ? geo.ll[1] : null
            },
            userId: user.id,
            date: new Date()
        }
        console.log(newLog);

        try {
            const log = await Logs.create(newLog);
            // sendJson(res, 200, log);
        } catch (err) {
            sendJson(res, 500, err)
        }

        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error);
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
    // console.log(token)
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
    }

    try {
        if (!email) {
            users = await Users.find();
        } else {
            if (moment(changeDateFormat(createdAt)).isValid()) {
                const date = moment(changeDateFormat(createdAt)).utc().format("MM/DD/YYYY");

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