const {getAllUsers, getAllUsersAnorganik, getAllUsersOrganik, getRecap, getUser} = require("../controllers/banksampahController");
const {protectAdmin, protectClient} = require("../middleware/checkRole");
const express = require('express');
const router = express.Router();

router.get('/', protectAdmin, getAllUsers);
router.get('/anorganik', protectAdmin, getAllUsersAnorganik);
router.get('/organik', protectAdmin, getAllUsersOrganik);
router.get('/recap', protectAdmin, getRecap);
router.get('/:id', protectClient, getUser);

module.exports = router;