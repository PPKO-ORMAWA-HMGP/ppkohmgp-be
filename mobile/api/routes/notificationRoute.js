const {getAllNotification} = require("../controllers/notificationController");
const {protectNotification} = require("../middleware/checkRole");
const express = require("express");
const router = express.Router();

router.get("/", protectNotification, getAllNotification);

module.exports = router;