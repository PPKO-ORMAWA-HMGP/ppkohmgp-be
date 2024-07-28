const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date : {
        type : Date,
        required : true
    },
    time : {
        type : String
    },
    type : {
        type : String,
        required : true,
        enum : ['add', 'penukaran', 'penarikan', 'profile', 'privacy']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

module.exports = mongoose.model("Notification", NotificationSchema);