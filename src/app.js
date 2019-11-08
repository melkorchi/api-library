let express = require('express');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
// let router = require('./routes/api-routes');
let routerUser = require('./routes/user');
let routerBook = require('./routes/book');
let routerLog = require('./routes/log');
let env = require("./environnement");
let app = express();
let port = process.env.PORT || 8080;

// mongoose.connect('mongodb://localhost:27017/library', { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connect(env.bdd.mongo.url, { useNewUrlParser: true, useUnifiedTopology: true });

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Use Api routes in the App
// app.use('/', router);
// Attention au préfixe
app.use('/users', routerUser);
app.use('/books', routerBook);
app.use('/logs', routerLog);


// Launch app to listen to specified port
app.listen(port, function() {
    console.log("Running API Rest NodeJS on port " + port);
});