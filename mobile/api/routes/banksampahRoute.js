const {getAllUsers, getAllUsersAnorganik, getAllUsersOrganik, getRecapbyDate} = require("../controllers/banksampahController");
const {protectAdminAnorganik, protectAdminOrganik, protectAdmin} = require("../middleware/checkRole");
const express = require('express');
const router = express.Router();

router.get('/', protectAdmin, getAllUsers);
router.get('/anorganik', protectAdminAnorganik, getAllUsersAnorganik);
router.get('/organik', protectAdminOrganik, getAllUsersOrganik);
router.get('/recap', protectAdmin, getRecapbyDate);

module.exports = router;