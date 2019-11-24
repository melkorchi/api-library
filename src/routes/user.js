let router = require('express').Router();
let usersController = require("../controllers/usersController");
const verifToken = require('../middlewares/verifToken');


router.post('/create', usersController.createUser);

// router.get('/', verifToken, usersController.allUsers);
router.get('/', usersController.allUsers);

router.get('/view/:id', verifToken, usersController.viewUser);

router.delete('/delete/:id', verifToken, usersController.removeUser);
router.put('/softdelete/:id', usersController.softRemoveUser);

// router.delete('/delete', verifToken, usersController.removeAllUsers);
router.delete('/delete', usersController.removeAllUsers);

router.get('/search', verifToken, usersController.search);
router.get('/search2', verifToken, usersController.searchUsers);
router.get('/searchUserByToken/:token', verifToken, usersController.searchUserByToken);

router.put('/update/:id', verifToken, usersController.updateUser);
router.post('/login', usersController.login);

router.get('/mdp-forgot/:email', usersController.mdpForgot);
router.put('/mdp-forgot/reinit-mdp', usersController.updateUserMdp);

module.exports = router;