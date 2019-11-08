const router = require('express').Router();
const booksController = require("../controllers/booksController");
const { check } = require('express-validator');
const verifCreateBook = require('../middlewares/verifCreateBook');
const verifAddComment = require('../middlewares/verifAddComment');

router.post('/create', [
    check('title').isLength({ min: 5 }).escape(), check('author').isLength({ min: 3 }).escape(), check('description').not().isEmpty().trim().escape()
], verifCreateBook, booksController.createBook);

router.get('/', booksController.getAllBooks);

router.get('/view/:id', booksController.viewBook);

router.put('/update/:id', [
    check('title').isLength({ min: 5 }).escape(), check('author').isLength({ min: 3 }).escape(), check('description').not().isEmpty().trim().escape()
], booksController.updateBook);

router.put('/:id/comment/add', verifAddComment, booksController.addComment);
router.put('/:id/comment/update', booksController.updateComment);
router.put('/:id/comment/delete/:idUser', booksController.removeComment);

router.delete('/delete', booksController.removeAllBooks);
router.delete('/delete/:id', booksController.removeBook);

router.get('/search/', booksController.searchBooks);

module.exports = router;