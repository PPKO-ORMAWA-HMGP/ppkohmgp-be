const {getDaftarNasabah, getAllUsersAnorganik, getAllUsersOrganik} = require("../controllers/banksampahController");
const {protectAdminAnorganik, protectAdminOrganik, protectAdmin} = require("../middleware/checkRole");
const express = require('express');
const router = express.Router();

router.get('/', protectAdmin, getDaftarNasabah);
router.get('/anorganik', protectAdminAnorganik, getAllUsersAnorganik);
router.get('/organik', protectAdminOrganik, getAllUsersOrganik);

module.exports = router;