const mongoose = require('mongoose');
const cities = require('./cities');
const {places,descriptors}= require('./seedHelpers')
const Complaint = require('../models/complaint')

mongoose.connect('mongodb://localhost/com-portal', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB= async()=>{
    await Complaint.deleteMany({})
    for(let i=0;i< 1;i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const c= new Complaint({
            author : '606f113ad3469f3048611666',
            location : `${cities[random1000].city}, ${cities[random1000].state}`,
            title : `${sample(descriptors)} ${sample(places)}`,
            category : "Garbage Dump",
            description : "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Libero asperiores atque adipisci cupiditate labore earum vitae tenetur necessitatibus laborum in aperiam architecto quasi veniam sapiente, assumenda expedita porro, maiores aliquid.",
            geometry :  { 
              type : "Point", 
              coordinates : [
                cities[random1000].longitude,
                cities[random1000].latitude
              ] 
            },
            images : [
                {
                  url: 'https://res.cloudinary.com/dcaywhic4/image/upload/v1618302258/Complaining_Project/xqtyvuwy4hkfq9dpkcqm.jpg',
                  filename: 'Complaining_Project/xqtyvuwy4hkfq9dpkcqm'
                },
                {
                  url: 'https://res.cloudinary.com/dcaywhic4/image/upload/v1618302258/Complaining_Project/njbxhzwz6rt4zzmutztd.jpg',
                  filename: 'Complaining_Project/njbxhzwz6rt4zzmutztd'
                }
              ]
        })
        await c.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})