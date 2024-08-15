const { google } = require('googleapis');
const path = require('path');

const DRIVEKEYFILEPATH = path.join(__dirname, "credentials_drive.json");
const SHEETKEYFILEPATH = path.join(__dirname, "credentials_spreadsheet.json");
const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive"];
const SHEET_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const driveauth = new google.auth.GoogleAuth({
    keyFile: DRIVEKEYFILEPATH,
    scopes: DRIVE_SCOPES,
});

const sheetauth = new google.auth.GoogleAuth({
    keyFile: SHEETKEYFILEPATH,
    scopes: SHEET_SCOPES,
});

module.exports = {driveauth, sheetauth};