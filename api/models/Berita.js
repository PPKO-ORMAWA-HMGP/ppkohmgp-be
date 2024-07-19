const mongoose = require('mongoose');

const beritaSchema = new mongoose.Schema({
    headline : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    date : {
        type : Date,
        default : Date.now,
        required : true
    }
})

module.exports = mongoose.model('Berita', beritaSchema);