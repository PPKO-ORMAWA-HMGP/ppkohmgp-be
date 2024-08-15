const { google } = require("googleapis");
const { driveauth } = require("./OAuth2");

const drive = google.drive({
    version: "v3",
    auth : driveauth
});

module.exports = drive;