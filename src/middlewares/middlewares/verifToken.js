const jwt = require('jsonwebtoken');
const env = require('../environnement');
const Users = require('../models/users');

const verifToken = async(req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token)
        return res.status(403).send({ err: true, auth: false, messageErr: 'No token provided.' });

    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    // jwt.verify(token, env.jwt, function(err, decoded) {
    jwt.verify(token, 'MekIbnMek20192020', function(err, decoded) {
        if (err) return res.status(500).send({ err: true, auth: false, messageErr: 'Failed to authenticate token.' });
        // IF everything good, save to request for use in other route
        const user = Users.findOne({ _id: decoded._id, 'tokens.token': token })
        req.decoded = decoded;
        req.user = user;
        req.token = token;
        // console.log('req', req)
        next();
    });
}

// const verifToken = (req, res, next) => {
//     if (!req.header('Authorization')) return res.status(403).send({ err: true, auth: false, messageErr: 'No token provided.' });

//     const token = req.header('Authorization').replace('Bearer ', '');
//     // const data = jwt.verify(token, process.env.JWT_KEY)

//     const data = jwt.verify(token, 'MekIbnMek20192020');

//     try {
//         const user = await User.findOne({ _id: data._id, 'tokens.token': token })
//         if (!user) {
//             throw new Error();
//         }
//         req.user = user;
//         req.token = token;
//         next();
//     } catch (error) {
//         res.status(401).send({ error: 'Not authorized to access this resource' });
//     }
// }

module.exports = verifToken;