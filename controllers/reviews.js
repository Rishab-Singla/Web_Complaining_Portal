const Complaint = require('../models/complaint');
const Review = require('../models/review');

module.exports.createReview = async (req,res)=>{
    const complaint = await Complaint.findById(req.params.id);
    const review = new Review(req.body);
    review.author = req.user._id;
    complaint.reviews.push(review);
    await review.save();
    await complaint.save();
    req.flash('success', 'Your review has been posted');
    res.redirect(`/complaints/${complaint._id}`)
}

module.exports.deleteReview = async(req,res)=>{
    const {id, reviewId} = req.params;
    await Complaint.findByIdAndUpdate(id, {$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted!!!');
    res.redirect(`/complaints/${id}`);
}