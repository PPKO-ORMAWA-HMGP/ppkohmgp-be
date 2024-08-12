const moment = require('moment');

const convertDateToMonthYear = (date) => {
    const formattedDate = moment.utc(date).format('MMMM YYYY');
    const indonesianDate = formattedDate.replace("January", "Januari").replace("February", "Februari").replace("March", "Maret").replace("April", "April").replace("May", "Mei").replace("June", "Juni").replace("July", "Juli").replace("August", "Agustus").replace("September", "September").replace("October", "Oktober").replace("November", "November").replace("December", "Desember");
    return indonesianDate;
}

const convertDateToDayMonthYear = (date) => {
    const formattedDate = moment.utc(date).format('DD MMMM YYYY');
    const indonesianDate = formattedDate.replace("January", "Januari").replace("February", "Februari").replace("March", "Maret").replace("April", "April").replace("May", "Mei").replace("June", "Juni").replace("July", "Juli").replace("August", "Agustus").replace("September", "September").replace("October", "Oktober").replace("November", "November").replace("December", "Desember");
    return indonesianDate;
}

module.exports = {convertDateToMonthYear, convertDateToDayMonthYear};