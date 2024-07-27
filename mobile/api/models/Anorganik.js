const mongoose = require ("mongoose");

const AnorganikSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Plastik', 'Kertas', 'Logam', 'Kaca', 'Lain-lain']
    },
    description : {
        type : String,
        required : true
    },
    mass : {
        type : Number,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    date : {
        type : Date,
        required : true
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
});

module.exports = mongoose.model("Anorganik", AnorganikSchema);