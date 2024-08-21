const mongoose = require ("mongoose");

const RecapSchema = new mongoose.Schema({
    organik_padat : {
        type : Number,
        default : 0.0
    },
    organik_cair : {
        type : Number,
        default : 0.0
    },
    biopori_jumbo : {
        type : Number,
        default : 0.0
    },
    biopori_komunal : {
        type : Number,
        default : 0.0
    },
    biopori_mandiri : {
        type : Number,
        default : 0.0
    },
    ember_tumpuk : {
        type : Number,
        default : 0.0
    },
    iosida : {
        type : Number,
        default : 0.0
    },
    tanggal : {
        type : String,
    },
    banksampah : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "BankSampah"
    }
});

module.exports = mongoose.model("Recap", RecapSchema);