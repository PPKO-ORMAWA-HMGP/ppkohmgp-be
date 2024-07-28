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
    users : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    }],
    organik : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Organik"
    }],
    anorganik : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Anorganik"
    }],
});

module.exports = mongoose.model("BankSampah", BankSampahSchema);