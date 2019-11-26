let express = require('express');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let routerUser = require('./routes/user');
let routerBook = require('./routes/book');
let routerLog = require('./routes/log');
let env = require("./environnement");
let app = express();
let port = process.env.PORT || 8080;
var cors = require('cors')

const conn = mongoose.connect(env.bdd.mongo.url, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Définition des CORS
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use('/users', routerUser);
app.use('/books', routerBook);
app.use('/logs', routerLog);

// Launch app to listen to specified port
app.listen(port, function() {
    console.log("Running API Rest NodeJS on port " + port);
});