const {registerUser, getUser, updateUser} = require('../controllers/userController');
const {protectClient} = require('../middleware/checkRole');
const express = require('express');
const router = express.Router();

router.post('', registerUser);
router.get('/:id', getUser);
router.patch('', protectClient, updateUser);

module.exports = router;