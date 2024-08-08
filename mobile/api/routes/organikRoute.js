const { createOrganik, verifyOrganik, riwayatOrganik } = require('../controllers/organikController');
const { protectAdminOrganik, protectOrganik } = require('../middleware/checkRole');
const express = require('express');
const router = express.Router();

router.route('/')
    .get(protectOrganik, riwayatOrganik)
    .post(protectOrganik, createOrganik);
router.route('/:id')
    .patch(protectAdminOrganik, verifyOrganik);

module.exports = router;