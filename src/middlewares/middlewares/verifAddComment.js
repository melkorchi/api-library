const Books = require('../controllers/booksController');


const verifAddComment = async(req, res, next) => {
    console.log('1')
    const book = await Books.searchComment(req, res);
    console.log('3 book', book);

    next();
}

module.exports = verifAddComment;