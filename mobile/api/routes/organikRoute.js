const { createOrganik, riwayatOrganik } = require('../controllers/organikController');
const { protectAdminOrganik, protectOrganik } = require('../middleware/checkRole');
const express = require('express');
const router = express.Router();

router.route('/')
    .get(protectOrganik, riwayatOrganik)
    .post(protectOrganik, createOrganik);


module.exports = router;