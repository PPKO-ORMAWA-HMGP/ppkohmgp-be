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
    },
    image : {
        type : String,
        required : true
    },
    feedback : {
        type : String,
        enum : ['Diterima', 'Ditolak', 'Menunggu'],
        default : 'Menunggu'
    }
})

module.exports = mongoose.model("Organik", OrganikSchema);