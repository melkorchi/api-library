module.exports = {
    env: false,
    url: "localhost",
    port: process.env.PORT || 3000,
    bdd: {
        mongo: {
            // url: "mongodb://localhost/library"
            //url: "mongodb+srv://<username>:<password>@cluster0-webya.mongodb.net/test?retryWrites=true&w=majority"
            url: process.env.MONGODB_URI
        }
    },
    smtp: {
        host: "",
        user: "",
        pass: "",
        port: "",
    },
    jwt: "questionsecrete"
}