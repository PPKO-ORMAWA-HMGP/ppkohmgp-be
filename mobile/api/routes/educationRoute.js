const { createEducation, getAllEducation, getEducation, updateEducation, deleteEducation} = require("../controllers/educationController");
const { protectAdmin } = require("../middleware/checkRole");
const express = require('express');
const router = express.Router();

router.route('/') 
    .get(getAllEducation)
    .post(protectAdmin, createEducation);

router.route('/:id')
    .patch(protectAdmin, updateEducation)
    .get(getEducation)
    .delete(protectAdmin, deleteEducation);

module.exports = router;