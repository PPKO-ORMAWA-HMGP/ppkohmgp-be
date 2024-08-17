const mongoose = require ("mongoose");

const AnorganikSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Plastik', 'Kertas', 'Logam', 'Kaca', 'Jelantah', 'Lain-lain']
    },
    description : {
        type : String,
        required : true
    },
    mass : {
        type : mongoose.Decimal128,
        required : true
    },
    price : {
        type : mongoose.Decimal128,
        required : true
    },
    date : {
        type : Date,
        required : true
    },
    tanggal : {
        type : String,
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
});

module.exports = mongoose.model("Anorganik", AnorganikSchema);