const env = require('../environnement');

const verifAdmin = (req, res, next) => {
    let role = req.headers['role'];
    // console.log(role);
    if (role !== 'ROLE_ADMIN')
        return res.status(403).send({ admin: false, message: 'Access denied.' });
    next();
}

module.exports = verifAdmin;