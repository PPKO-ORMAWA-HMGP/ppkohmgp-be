const {getAllBerita} = require('../controllers/beritaController');
const express = require('express');
const router = express.Router();

router.get('/', getAllBerita);

module.exports = router;