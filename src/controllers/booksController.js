const Books = require('../models/books');
const { validationResult } = require('express-validator');
const qs = require('qs');
const moment = require('moment');

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

if (!Date.prototype.adjustDate) {
    Date.prototype.adjustDate = function(days) {
        var date;

        days = days || 0;

        if (days === 0) {
            date = new Date(this.getTime());
        } else if (days > 0) {
            date = new Date(this.getTime());

            date.setDate(date.getDate() + days);
        } else {
            date = new Date(
                this.getFullYear(),
                this.getMonth(),
                this.getDate() - Math.abs(days),
                this.getHours(),
                this.getMinutes(),
                this.getSeconds(),
                this.getMilliseconds()
            );
        }

        this.setTime(date.getTime());

        return this;
    };
}



// Create a book
exports.createBook = async(req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendJson(res, 422, errors.array());
    }

    let links = req.body.links;
    console.log('links', links)
    links = qs.parse(links);
    console.log('links', links.links)

    const newBook = {
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        urlImage: req.body.urlImage,
        publishedDate: req.body.publishedDate,
        rating: {
            rate: req.body.rate,
            comment: req.body.comment,
            userId: req.body.userId
                // commentPublicationDate: new Date()
        },
        links: links.links
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

    let links = req.body.links;
    console.log('body', req.body)
    links = qs.parse(links);
    console.log('links', links.links)

    let updateBook = {
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        publishedDate: req.body.publishedDate,
        urlImage: req.body.urlImage,
        // publishedDate: new Date(req.body.publishedDate),
        rating: {
            rate: req.body.rate,
            comment: req.body.comment,
            userId: req.body.userId,
            commentPublicationDate: req.body.oldCommentDate
        },
        links: links.links
    }

    if (req.body.isNewComment == 'true') updateBook.rating.commentPublicationDate = new Date();



    // console.log('idBooksss', req.params.id)
    // console.log('updateBook', updateBook)

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

exports.searchBooks2 = async(req, res) => {
    const params = qs.parse(req.query);
    // const params = req.query;

    const title = params.title;
    const author = params.author;
    let publishedDate = params.publishedDate;
    let books = [];
    const changeDateFormat = (inputDate) => { // expects d/m/y
        var splitDate = inputDate.split('/');
        if (splitDate.count == 0) {
            return null;
        }

        var year = splitDate[2];
        var month = splitDate[1];
        var day = splitDate[0];

        return month + '/' + day + '/' + year;
        // return year + '/' + month + '/' + day;
    }

    // console.log(title, author, publishedDate);

    try {
        if (!title) {
            books = await Books.find();
        } else {
            if (moment(changeDateFormat(publishedDate)).isValid()) {
                // const date = moment(changeDateFormat(publishedDate)).utc().format("MM/DD/YYYY");
                const date = moment(changeDateFormat(publishedDate)).utc().format("MM/DD/YYYY");
                console.log('moment', date);
                console.log(changeDateFormat(publishedDate));
                console.log('publishedDate Date', new Date(date));
                console.log('publishedDate Date +1', new Date(date).addDays(1));
                console.log('publishedDate Date +2', new Date(date).addDays(2));

                books = await Books.find({
                    "publishedDate": {
                        "$gte": new Date(date),
                        "$lt": new Date(date).addDays(2)
                    }
                });
                // books = await Books.find({ "publishedDate": new Date(publishedDate) })
            } else {
                console.log('string');
                books = await Books.find({ $or: [{ title: title }, { author: author }] });
            }
        }

        return (books.length < 1) ? sendJson(res, 402, "0 résultat trouvé") : sendJson(res, 200, books);
    } catch (err) {
        return sendJson(res, 500, err);
    }
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
            const book = await Books.find({ id: req.params.id }, { "rating.userId": req.body.userId });
            console.log("2 book", book);
            // if (book.length < 1) resolve("Go On");
            // else reject("Already commented by this user");
            resolve(sendJson(res, 200, book));
        } catch (err) {
            reject(sendJson(res, 500, err));
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

    console.log(rating);

    try {
        const book = await Books.update({ id: req.params.id }, { $pull: { rating: { userId: rating.userId } } });
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

exports.findByCommentIdUser = async(req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return sendJson(res, 422, errors.array());
    // }
    // console.log(req.params)

    try {
        const book = await Books.find({ id: req.params.idBook, 'rating.userId': req.params.commentIdUser });
        // if (book.length < 1) sendJson(res, 200, "Never commented");
        sendJson(res, 200, book);
    } catch (err) {
        sendJson(res, 500, err);
    }

};

// Remove comment
exports.removeComment = async(req, res) => {
    try {
        const book = await Books.update({ id: req.params.id }, { $pull: { rating: { userId: req.params.idUser } } });
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