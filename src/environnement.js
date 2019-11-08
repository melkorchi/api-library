module.exports = {
    env: false,
    url: "localhost",
    port: 3000,
    bdd: {
        mongo: {
            url: "mongodb://localhost/library"
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