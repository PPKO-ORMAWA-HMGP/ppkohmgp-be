const { createOrganik, getLinkImage, verifyOrganik, riwayatOrganik} = require('../controllers/organikController');
const { protectAdminOrganik, protectOrganik } = require('../middleware/checkRole');
const convertToBuffer = require('../middleware/convertToBuffer');
const express = require('express');
const router = express.Router();

router.route('/')
    .get(protectOrganik, riwayatOrganik)
    .post(protectOrganik, convertToBuffer.any(), createOrganik);
router.route('/:id')
    .get(protectAdminOrganik, getLinkImage)
    .patch(protectAdminOrganik, verifyOrganik);

module.exports = router;