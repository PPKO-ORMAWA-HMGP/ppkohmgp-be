const {getNotification} = require("../controllers/notificationController");
const {protectClient} = require("../middleware/checkRole");
const express = require("express");
const router = express.Router();

router.get("/:id", protectClient, getNotification);

module.exports = router;