const express = require('express');
const router = express.Router();
const complaints = require('../controllers/complaints'); 
const wrapAsync = require('../utilities/wrapAsync');
const {isLoggedIn, validateComplaint, isAuthor} = require('../middleware');
const Complaint = require('../models/complaint');
const multer  = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage })

const categories=['Garbage Dump','Pits','Traffic Lights','Others'];

router.route('/')
    .get(wrapAsync(complaints.index))
    .post(isLoggedIn, upload.array('image'), validateComplaint, wrapAsync(complaints.createComplaint))

router.get('/new', isLoggedIn, complaints.renderNewForm);

router.route('/:id')
    .get(wrapAsync(complaints.showComplaint))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateComplaint, wrapAsync(complaints.updateComplaint))
    .delete(isLoggedIn, isAuthor, wrapAsync(complaints.deleteComplaint))

router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(complaints.renderEditForm))

module.exports = router;