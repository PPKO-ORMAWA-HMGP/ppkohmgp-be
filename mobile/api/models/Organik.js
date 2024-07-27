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
    }
})

module.exports = mongoose.model("Organik", OrganikSchema);