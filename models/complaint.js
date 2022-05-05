const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url : String,
    filename : String
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload','/upload/w_200');
})

const opts = { toJSON: { virtuals: true } };

const ComplaintSchema = new Schema({
    title : String,
    images : [ImageSchema],
    geometry: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    category :{
        type : String,
        enum : ['Garbage Dump','Pits','Traffic Lights','Others']
    },
    description : String,
    location : String,
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
}, opts);

ComplaintSchema.virtual('properties.popUpMarkup').get(function() {
    return `
    <b><a href="/complaints/${this._id}">${this.title}</a></b>
    <p>${this.description.substring(0, 20)}...</p>`
})

ComplaintSchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await Review.deleteMany({_id : {$in : doc.reviews}})
    }
})

module.exports = mongoose.model('Complaint', ComplaintSchema);
