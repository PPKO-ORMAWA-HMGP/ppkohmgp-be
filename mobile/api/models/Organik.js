const mongoose = require ("mongoose");

const OrganikSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    mass : {
        type : Number,
        required : true
    },
    date : {
        type : Date,
        required : true
    },
    tanggal : {
        type : String
    }
})

module.exports = mongoose.model("Organik", OrganikSchema);