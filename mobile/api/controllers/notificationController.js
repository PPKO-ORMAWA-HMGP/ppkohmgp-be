const Notification = require("../models/Notification");
const moment = require('moment');

exports.getAllNotification = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort({date:-1}).select("-__v -user -_id");
        //perbedaan dalam hari
        notifications.forEach(notification => {
            const today = Date.now() + 7*60*60*1000;
            const formattedToday = moment.utc(today).format("DD MM YYYY");
            const formattedNotification = moment.utc(notification.date).format("DD MM YYYY");
            if (formattedToday === formattedNotification) notification.time = "hari ini";
            else notification.time = "kemarin"

        });
        res.status(200).json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}