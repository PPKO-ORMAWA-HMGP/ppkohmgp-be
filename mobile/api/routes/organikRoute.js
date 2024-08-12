const { createOrganik, getLinkImage, verifyOrganik, riwayatOrganik} = require('../controllers/organikController');
const { protectAdminOrganik, protectOrganik } = require('../middleware/checkRole');
const multer = require('multer');
const upload = multer()
const express = require('express');
const router = express.Router();

router.route('/')
    .get(protectOrganik, riwayatOrganik)
    .post(protectOrganik, upload.any(), createOrganik);
router.route('/:id')
    .get(protectAdminOrganik, getLinkImage)
    .patch(protectAdminOrganik, verifyOrganik);

module.exports = router;