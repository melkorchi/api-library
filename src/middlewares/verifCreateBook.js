const Books = require('../controllers/booksController');


const verifCreateBook = async(req, res, next) => {
    console.log('1')
    const books = await Books.search(req, res);
    console.log('3')
    next();
}

module.exports = verifCreateBook;