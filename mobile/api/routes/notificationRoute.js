const {getAllNotification} = require("../controllers/notificationController");
const {protectClient} = require("../middleware/checkRole");
const express = require("express");
const router = express.Router();

router.get("/", protectClient, getAllNotification);

module.exports = router;