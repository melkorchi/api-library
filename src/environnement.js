module.exports = {
    env: false,
    url: "localhost",
    port: process.env.PORT || 3000,
    bdd: {
        mongo: {
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