let router = require('express').Router();
let usersController = require("../controllers/usersController");


router.post('/create', usersController.createUser);
router.get('/', usersController.allUsers);
router.get('/view/:id', usersController.viewUser);


router.delete('/delete/:id', usersController.removeUser);
router.delete('/delete', usersController.removeAllUsers);



router.get('/search', usersController.search);

router.put('/update/:id', usersController.updateUser);
router.post('/login', usersController.login);

module.exports = router;