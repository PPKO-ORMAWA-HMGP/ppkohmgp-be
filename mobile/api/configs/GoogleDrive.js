const { google } = require("googleapis");
const auth = require("./OAuth2");

const drive = google.drive({
    version: "v3",
    auth
});

module.exports = drive;