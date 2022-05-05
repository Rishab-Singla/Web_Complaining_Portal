const express = require('express');
const router = express.Router({mergeParams : true});
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const wrapAsync = require('../utilities/wrapAsync');
const ExpressError = require('../utilities/ExpressError');
const Complaint = require('../models/complaint');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview));

module.exports = router;