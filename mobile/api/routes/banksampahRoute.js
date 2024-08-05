const {getAllUsers, getAllUsersAnorganik, getAllUsersOrganik, getRecapPerPeriod} = require("../controllers/banksampahController");
const {protectAdminAnorganik, protectAdminOrganik, protectAnorganik, protectOrganik, protectAdmin} = require("../middleware/checkRole");
const express = require('express');
const router = express.Router();

router.get('/', protectAdmin, getAllUsers);
router.get('/anorganik', protectAdminAnorganik, getAllUsersAnorganik);
router.get('/organik', protectAdminOrganik, getAllUsersOrganik);
router.get('/recap', protectAdmin, getRecapPerPeriod);

module.exports = router;