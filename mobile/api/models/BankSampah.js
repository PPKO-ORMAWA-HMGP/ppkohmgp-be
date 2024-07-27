const mongoose = require("mongoose");

const BankSampahSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    admins : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    }]
});

module.exports = mongoose.model("BankSampah", BankSampahSchema);