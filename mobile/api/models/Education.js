const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const EducationSchema = new mongoose.Schema(
    {
        _id : Number,
        title: {
            type: String,
            required: true
        },
        content : {
            type: String
        },
        synopsis: {
            type: String
        },
        date : {
            type : Date,
            required : true,
            default : Date.now() + 7 * 60 * 60 * 1000
        },
        image : {
            type: String
        },
        link : {
            type : String
        }
    },
    {_id : false}
);

EducationSchema.plugin(AutoIncrement)
module.exports = mongoose.model("Education", EducationSchema);