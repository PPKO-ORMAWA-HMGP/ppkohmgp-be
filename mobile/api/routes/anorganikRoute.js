const {createAnorganik, riwayatAnorganik} = require('../controllers/anorganikController');
const {protectAdminAnorganik, protectClient} = require('../middleware/checkRole');
const express = require('express');
const router = express.Router();

router.get('/', protectClient, riwayatAnorganik);
router.post('/', protectAdminAnorganik, createAnorganik);

module.exports = router;