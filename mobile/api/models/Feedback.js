const mongoose = require("mongoose")

const FeedbackSchema = new mongoose.Schema({
    komentar : {
        type : String,
        required
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
})

module.exports = mongoose.model("Feedback", FeedbackSchema)