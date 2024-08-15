const googleSheets = require('../configs/Spreadsheet');

require('dotenv').config();

exports.getRows = async (range) => {
    try {
        const res = await googleSheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range
        });
        return res.data.values;
    } catch (err) {
        throw err;
    }
}
