module.exports = {
    env: false,
    url: "localhost",
    port: 3000,
    bdd: {
        mongo: {
            // url: "mongodb://localhost/library"
            url: "mongodb+srv://<username>:<password>@cluster0-webya.mongodb.net/test?retryWrites=true&w=majority"
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