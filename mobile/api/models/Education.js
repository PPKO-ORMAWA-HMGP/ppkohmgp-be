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
            default : Date.now,
        },
        image : {
            type: String
        }
    },
    {_id : false}
);

EducationSchema.plugin(AutoIncrement)
module.exports = mongoose.model("Education", EducationSchema);