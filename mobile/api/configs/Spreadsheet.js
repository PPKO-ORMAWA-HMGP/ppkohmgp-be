const { google } = require('googleapis');
const { sheetauth } = require('./OAuth2');

const googleSheets = google.sheets({
    version: 'v4',
    auth : sheetauth
});

module.exports = googleSheets;