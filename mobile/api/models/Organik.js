const mongoose = require ("mongoose");
var Int32 = require('mongoose-int32');

const OrganikSchema = new mongoose.Schema({
    date : {
        type : Date
    },
    tanggal : {
        type : String
    },
    image : {
        type : String
    },
    price : {
        type : Int32
    },
    type : {
        type : String,
        enum : ['Tambah Poin', 'Tukar Poin']
    },
    kriteria : {
        type : String,
        enum : ['Diterima', 'Ditolak', 'Menunggu'],
        default : 'Menunggu'
    },
    feedback : {
        type : String
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
})

module.exports = mongoose.model("Organik", OrganikSchema);