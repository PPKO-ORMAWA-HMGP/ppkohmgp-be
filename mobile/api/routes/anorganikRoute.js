const {createAnorganik, riwayatAnorganik, tarikSaldo} = require('../controllers/anorganikController');
const {protectAdminAnorganik, protectAnorganik} = require('../middleware/checkRole');
const express = require('express');
const router = express.Router();

// Client
router
    .get('/', protectAnorganik, riwayatAnorganik)
    .patch('/', protectAdminAnorganik, tarikSaldo);

//Admin
router.post('/:id', protectAdminAnorganik, createAnorganik);

module.exports = router;