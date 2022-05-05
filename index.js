if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express')
const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const complaintRoutes = require('./routes/complaints');
const reviewRoutes = require('./routes/reviews');

// const MongoStore = require("connect-mongo");

// const dbUrl = process.env.DB_URL;

const dbUrl = 'mongodb://localhost/com-portal';

mongoose.connect(dbUrl, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database connected');
});

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize({
  replaceWith: '_'
}))

// const store = new MongoStore({
//     url: dbUrl,
//     secret : 'thisshouldbeabettersecret',
//     touchAfter: 24 * 60 * 60
// })

// store.on("error", function(e) {
//     console.log("SESSION STORE ERROR", e);
// })

const sessionConfig = {
    // store: MongoStore.create({
    //     mongoUrl: dbUrl,
    //     secret : 'thisshouldbeabettersecret',
    //     touchAfter: 24 * 60 * 60
    // }),
    name : 'session',
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

// sessionConfig.store.on("error", function(e) {
//     console.log("SESSION STORE ERROR", e);
// })

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dcaywhic4/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes)
app.use('/complaints', complaintRoutes)
app.use('/complaints/:id/reviews', reviewRoutes)

app.get('/',(req,res)=>{
    res.render('home')
})


app.all('*',(req,res,next)=>{
    next(new ExpressError("OOPS!!!!!!!!!Page Not Found",404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message){
        err.message = "OH NO!!!! SOMETHING WENT WRONG"
    }
    res.status(statusCode).render('error',{err});
})

app.listen(8000,()=>{
    console.log("Listening on PORT 8000")
})