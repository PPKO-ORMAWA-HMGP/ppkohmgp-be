const {registerUser, getUser, updateUser, loadUser} = require('../controllers/userController');
const {protectClient} = require('../middleware/checkRole');
const express = require('express');
const router = express.Router();

router.route('/')
    .post(registerUser)
    .get(protectClient, loadUser)
    .patch(protectClient, updateUser);
  
router.get('/:id', getUser);

module.exports = router;