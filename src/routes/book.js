const router = require('express').Router();
const booksController = require("../controllers/booksController");
const { check } = require('express-validator');
const verifCreateBook = require('../middlewares/verifCreateBook');
const verifAddComment = require('../middlewares/verifAddComment');
const verifToken = require('../middlewares/verifToken');
const verifAdmin = require('../middlewares/verifAdmin');

router.post('/create', [
    check('title').isLength({ min: 5 }), check('author').isLength({ min: 3 }), check('description').not().isEmpty().trim()
], verifToken, verifCreateBook, booksController.createBook);

router.get('/', verifToken, booksController.getAllBooks);

router.get('/view/:id', verifToken, booksController.viewBook);

router.put('/update/:id', [
    check('title').isLength({ min: 5 }), check('author').isLength({ min: 3 }), check('description').not().isEmpty().trim()
], verifToken, booksController.updateBook);

router.put('/:id/comment/add', verifToken, verifAddComment, booksController.addComment);
router.put('/:id/comment/update', verifToken, booksController.updateComment);
router.put('/:id/comment/delete/:idUser', verifToken, booksController.removeComment);
// Supprimer tous les commentaires d'un livre
// router.put('/:id/comment/delete', verifToken, booksController.removeAllCommentsOfThisBook);
// Supprimer tous les commentaires de tous les livres
// router.put('/comment/delete', verifToken, booksController.removeAllComments);


router.delete('/delete', verifToken, booksController.removeAllBooks);
router.delete('/delete/:id', verifToken, booksController.removeBook);

router.get('/search/', verifToken, booksController.searchBooks);
router.get('/search2/', verifToken, booksController.searchBooks2);
router.get('/search3/:idBook/:commentIdUser', verifToken, booksController.findByCommentIdUser);


module.exports = router;