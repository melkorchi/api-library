const Books = require('../models/books');
const { validationResult } = require('express-validator');

// Create a book
exports.createBook = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendJson(res, 422, errors.array());
    }

    const links = [
        { name: "Amazon1", link: "www.amazon1.fr" },
        { name: "Amazon2", link: "www.amazon2.fr" },
    ];

    const newBook = {
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        publishedDate: req.body.publishedDate,
        rating: {
            rate: req.body.rate,
            comment: req.body.comment,
            userId: req.body.userId
                // commentPublicationDate: new Date()
        },
        links: links
    }

    if (req.body.comment) newBook.rating.commentPublicationDate = new Date();

    try {
        const book = await Books.create(newBook);
        sendJson(res, 200, book);
    } catch (err) {
        sendJson(res, 500, err)
    }
};

// Retrieve book(by title) or all books
exports.listBooks = (req, res) => {
    Books.find({}, function(err, books) {
        return (err) ? sendJson(res, 501, err) : (books.length > 1) ? sendJson(res, 200, books) : sendJson(res, 402, "Collection books empty");
    });
};

// Other version
exports.getAllBooks = async(req, res) => {
    try {
        const books = await Books.find();
        return (books.length > 0) ? sendJson(res, 200, books) : sendJson(res, 402, "Collection books is empty");
    } catch (err) {
        return sendJson(res, 500, err);
    }
};

// Retrieve a book
exports.viewBook = async(req, res) => {
    try {
        const book = await Books.find({ id: req.params.id });
        // console.log(book);
        return (book.length < 1) ? sendJson(res, 402, "Book not found") : sendJson(res, 200, book);
    } catch (err) {
        return sendJson(res, 500, err);
    }
}

// Update a book
exports.updateBook = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendJson(res, 422, errors.array());
    }

    const links = [
        { name: "Amazon3", link: "www.amazon3.fr" },
        { name: "Amazon4", link: "www.amazon4.fr" },
    ];

    const updateBook = {
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        publishedDate: req.body.publishedDate,
        // rating: {
        //     rate: req.body.rate,
        //     comment: req.body.comment,
        //     userId: req.body.userId,
        //     commentPublicationDate: new Date()
        // },
        links: links
    }

    try {
        const book = await Books.findOneAndUpdate({ id: req.params.id }, updateBook, { new: true });
        sendJson(res, 200, "Updated");
    } catch (err) {
        sendJson(res, 500, err);
    }
};

// Remove a book
exports.removeBook = async(req, res) => {
    try {
        await Books.findOneAndDelete({ id: req.params.id });
        // return (book.length < 1) ? sendJson(res, 402, "Book not found") : sendJson(res, 200, "Book removed");
        sendJson(res, 200, "Book removed");
    } catch (err) {
        sendJson(res, 500, err);
    }
}

// Remove all books
exports.removeAllBooks = async(req, res) => {
    try {
        await Books.deleteMany();
        sendJson(res, 200, "Collection books cleared");
    } catch (err) {
        sendJson(res, 500, err);
    }
}

// Search
exports.searchBooks = (req, res) => {
    Books.apiQuery(req.query).select("id title author publishedDate description rating links")
        .then(books => res.status(200).json(books))
        .catch(err => res.status(500).json(err));
}

// Utilsation dans le middleware de vérification lors du create
exports.search = async(req, res) => {
    return new Promise(async(resolve, reject) => {
        try {
            const book = await Books.find({ title: req.body.title, author: req.body.author });
            console.log("2");
            // if (book.length > 0) resolve(book);
            // else reject(res.json("Book not found"));
            if (book.length < 1) resolve("go on");
            else reject(res.json("Already exist"));
        } catch (err) {
            reject(res.json("Erreur serveur"));
        }
    });
}

// Add Comment
exports.addComment = async(req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return sendJson(res, 422, errors.array());
    // }

    const rating = {
        rate: req.body.rate,
        comment: req.body.comment,
        userId: req.body.userId,
        commentPublicationDate: new Date()
    };

    try {
        const book = await Books.update({ id: req.params.id }, { $addToSet: { rating: { $each: [rating] } } });
        sendJson(res, 200, "Comment added");
    } catch (err) {
        sendJson(res, 500, err);
    }

};

// Utilsation dans le middleware de vérification lors du add commentaire
exports.searchComment = async(req, res) => {
    return new Promise(async(resolve, reject) => {
        try {
            const comment = await Books.find({ "rating.userId": req.body.userId });
            console.log("2");
            if (comment.length < 1) resolve("go on");
            else reject(res.json("Already commented by this user"));
        } catch (err) {
            reject(res.json("Erreur serveur"));
        }
    });
}

// Update comment
exports.updateComment = async(req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return sendJson(res, 422, errors.array());
    // }

    const rating = {
        rate: req.body.rate,
        comment: req.body.comment,
        userId: req.body.userId,
        commentPublicationDate: new Date()
    };

    try {
        const book = await Books.update({ id: req.params.id }, { $pull: { rating: { userId: req.body.userId } } });
        try {
            const book = await Books.update({ id: req.params.id }, { $addToSet: { rating: { $each: [rating] } } });
            sendJson(res, 200, "Comment updated");
        } catch (err) {
            sendJson(res, 500, err);
        }
    } catch (err) {
        sendJson(res, 500, err);
    }

};

// Remove comment
exports.removeComment = async(req, res) => {
    // const userId = 3;
    const userId = req.params.idUser;

    try {
        const book = await Books.update({ id: req.params.id }, { $pull: { rating: { userId: userId } } });
        sendJson(res, 200, "Comment removed");
    } catch (err) {
        sendJson(res, 500, err);
    }
};







/**
 * function sendJson 
 * @param res {Object}
 * @param code {Integer}
 * @param data {Any}
 * @return res
 */
function sendJson(res, code = 200, data = "") {
    res.status(code);
    // Rappel code 200 OK et code 201 Created
    if (code === 200 || code === 201) {
        return res.json({
            err: false,
            httpCode: code,
            books: data
        })
    }
    return res.json({
        err: true,
        httpCode: code,
        messageErr: data
    })
}