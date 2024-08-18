const mongoose = require ("mongoose");

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
    poin : {
        type : Number
    },
    type : {
        type : String,
        enum : ['Tambah Poin', 'Tukar Poin']
    },
    kriteria : {
        type : String,
        enum : ['Diterima', 'Ditolak', 'Menunggu', 'Ditukar'],
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