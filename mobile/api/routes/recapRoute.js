const { getRecap, sendRecap, updateRecap, countNasabah } = require('../controllers/recapController');
const { protectAdmin } = require('../middleware/checkRole');
const express = require('express');
const router = express.Router();

router.route('/')
    .post(protectAdmin, sendRecap)
    .get(protectAdmin, getRecap)
    .patch(protectAdmin, updateRecap);
router.route('/nasabah')
    .get(protectAdmin, countNasabah);

module.exports = router;