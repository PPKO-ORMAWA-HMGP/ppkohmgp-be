const {createAnorganik, riwayatAnorganik} = require('../controllers/anorganikController');
const {protectAdminAnorganik, protectAnorganik} = require('../middleware/checkRole');
const express = require('express');
const router = express.Router();

// Client
router.get('/', protectAnorganik, riwayatAnorganik);

//Admin
router.post('/:id', protectAdminAnorganik, createAnorganik);

module.exports = router;