const Books = require('../controllers/booksController');


const verifAddComment = async(req, res, next) => {
    console.log('1')
    const comment = await Books.searchComment(req, res);
    console.log('3')
    next();
}

module.exports = verifAddComment;