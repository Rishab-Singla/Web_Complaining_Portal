const {complaintSchema, reviewSchema} = require('./joi_schemas')
const ExpressError = require('./utilities/ExpressError');
const Complaint = require('./models/complaint');
const Review = require('./models/review');

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be signed in');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateComplaint = (req,res,next)=>{
    const {error} = complaintSchema.validate(req.body);
    if(error){
        msg = error.details.map(el =>el.message).join(',')
        throw new ExpressError(msg,400);
    } else{
        next();
    }
}

module.exports.isAuthor = async (req,res,next)=>{
    const {id} = req.params;
    const complaint = await Complaint.findById(id);
    if(!complaint.author._id.equals(req.user._id)) {
        req.flash('error', "You don't have permission to do that");
        return res.redirect(`/complaints/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req,res,next)=>{
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author._id.equals(req.user._id)) {
        req.flash('error', "You don't have permission to do that");
        return res.redirect(`/complaints/${id}`);
    }
    next();
}

module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        msg = error.details.map(el =>el.message).join(',')
        throw new ExpressError(msg,400);
    } else{
        next();
    }
}