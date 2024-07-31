const {getAllUsers, getAllUsersAnorganik, getAllUsersOrganik, getRecapPerPeriod} = require("../controllers/banksampahController");
const {protectAdmin, protectAnorganik, protectOrganik} = require("../middleware/checkRole");
const express = require('express');
const router = express.Router();

router.get('/', protectAdmin, getAllUsers);
router.get('/anorganik', protectAnorganik, getAllUsersAnorganik);
router.get('/organik', protectOrganik, getAllUsersOrganik);
router.get('/recap', protectAdmin, getRecapPerPeriod);

module.exports = router;