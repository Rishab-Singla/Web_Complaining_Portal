const Complaint = require('../models/complaint');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken : mapBoxToken})

const { cloudinary } = require('../cloudinary');

const categories=['Garbage Dump','Pits','Traffic Lights','Others'];

module.exports.index = async (req,res)=>{
    const {category} = req.query;
    if(category){
        const complaints = await Complaint.find({category})
        res.render('complaints/index',{ complaints,category});
    } else {
        const complaints = await Complaint.find({})
        res.render('complaints/index',{ complaints,category:"All"});
    }
}

module.exports.renderNewForm = (req,res)=>{
    res.render('complaints/new',{categories});
}

module.exports.createComplaint = async (req,res,next)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    const complaint = new Complaint(req.body);
    complaint.geometry = geoData.body.features[0].geometry;
    complaint.images = req.files.map(f => ({ url : f.path, filename : f.filename}));
    complaint.author = req.user._id;
    await complaint.save();
    req.flash('success','A complaint is registered!')
    res.redirect(`/complaints/${complaint._id}`)
}

module.exports.showComplaint = async (req,res)=>{
    const {id}=req.params;
    const complaint = await Complaint.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!complaint) {
        req.flash('error',"This Complaint can't be found")
        return res.redirect('/complaints');
    }
    res.render('complaints/show',{complaint,categories})
}

module.exports.renderEditForm = async(req,res)=>{
    const {id}=req.params;
    const complaint = await Complaint.findById(id);
    if(!complaint) {
        req.flash('error',"This Complaint can't be found")
        return res.redirect('/complaints');
    }
    res.render('complaints/edit',{complaint,categories})
}

module.exports.updateComplaint = async(req,res)=>{
    const {id} = req.params;
    const complaint = await Complaint.findByIdAndUpdate(id, req.body,{ runValidators:true, new:true});
    const imgs = req.files.map(f => ({ url : f.path, filename : f.filename}));
    complaint.images.push(...imgs);
    await complaint.save();
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await complaint.updateOne({ $pull: { images: { filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success','Your complaint has been updated!')
    res.redirect(`/complaints/${complaint._id}`);
}

module.exports.deleteComplaint = async (req,res)=>{
    const {id} = req.params;
    const deletedComplaint = await Complaint.findByIdAndDelete(id);
    req.flash('success', 'The campground has been deleted!');
    res.redirect('/complaints');
}