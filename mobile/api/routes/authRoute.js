const { login, validateToken } = require('../controllers/authController');
const express = require('express');
const router = express.Router();

router.post('/', login);
router.post('/validate', validateToken);

module.exports = router;