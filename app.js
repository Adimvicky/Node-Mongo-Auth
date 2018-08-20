const express = require('express'),
     mongoose = require('mongoose'),
     passport = require('passport'),
     localStrategy = require('passport-local'),
     bodyParser = require('body-parser'),
     expressSession = require('express-session'),
     User = require('./models/user.js');


mongoose.connect('mongodb://localhost/authdemo');


var app = express(); // Express App Instance

app.set('view engine', "ejs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended : true}));

app.use(expressSession({
  secret : "some text in here",
  resave : false,
  saveUninitialized : false
}));

// Passport Set Up 

app.use(passport.initialize());
app.use(passport.session());



passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





//  ROUTES


app.get('/', (req, res) => {
  res.render('home.ejs')
});

app.get('/secret', isLoggedIn, (req, res) => {
  res.render('secret.ejs')
});

app.get('/register', (req, res) => {
  res.render('register.ejs')
})




// AUTH ROUTES

app.post('/register', (req, res) => {
   var username = req.body.username;
   var password = req.body.password;

   User.register(new User({username}), password, (err,user) => {
     if(err){
       res.redirect('/register');
       console.log("Error registering user");
     } else {
       passport.authenticate('local')(req, res, () => {
        res.redirect('/secret');
        console.log("User "+ username +" registered");
       })
     }
   })
})


// LOGIN ROUTES


app.get('/login', (req, res) => {
  res.render('login.ejs')
});

app.post('/login', passport.authenticate('local', {
  successRedirect : "/secret",
  failureRedirect : "/login"
}) ,(req, res) => {
});


// LOG OUT ROUTES


app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/')
});



function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    console.log()
    res.redirect('/login')
  }
}


app.listen(3000, () => {
  console.log("Server running on localhost:3000...")
});
