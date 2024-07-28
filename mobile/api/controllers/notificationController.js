const Notification = require("../models/Notification");

exports.getNotification = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.params.id }).sort({date:-1}).select("-__v -user -_id");
        if (notifications.length === 0) return res.status(404).json({ message: "Notification not found" });
        //perbedaan dalam hari
        notifications.forEach(notification => {
            const today = Date.now() + 7*60*60*1000;
            const diffTime = today - notification.date;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            if (diffDays < 1) {
                notification.time = "hari ini";
            }
            else {
                notification.time = "kemarin";
            }
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}