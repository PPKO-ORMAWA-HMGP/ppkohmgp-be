const mongoose = require ("mongoose");

const OrganikSchema = new mongoose.Schema({
    name : {
        type : String
    },
    mass : {
        type : Number
    },
    date : {
        type : Date
    },
    tanggal : {
        type : String
    },
    image : {
        type : String
    },
    kriteria : {
        type : String,
        enum : ['Diterima', 'Ditolak', 'Menunggu'],
        default : 'Menunggu'
    },
    type : {
        type : String,
        enum : ['Tambah Poin', 'Tukar Poin']
    },
    price : {
        type : String
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