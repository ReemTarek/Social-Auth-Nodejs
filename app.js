const express = require('express');
const app = express();
const session = require('express-session');

app.set('view engine', 'ejs');

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'SECRET' 
}));
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
var facebookProfile;
var userProfile;

app.use(passport.initialize());
app.use(passport.session());


app.get('/success', (req, res) => {res.render("pages/success",{"user": userProfile})});
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: "69371011480-jbtsvlcunnmlhqv8tu9dmhv0ee2hr4s6.apps.googleusercontent.com",
    clientSecret: "OKEAg7ct4CP3XQ6IR6tQ1Hah",
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
passport.use(new FacebookStrategy({
  clientID: "721820941753715",
  clientSecret: "d0d63000b5dc745f13c736bdbf660d4e",
  callbackURL: "http://localhost:3000/auth/facebook/callback"
}, function (accessToken, refreshToken, facebookProfile, done) {
  console.log(facebookProfile)
  return done(null, facebookProfile);
}
));
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/success');
  });
app.get('/', function(req, res) {
  res.render('pages/auth');
});
app.get('/profile', isLoggedIn, function (req, res) {
  console.log(req.user)
  res.render('pages/profile.ejs', {
    user: req.user // get the user out of session and pass to template
  });
});

app.get('/error', isLoggedIn, function (req, res) {
  res.render('pages/error.ejs');
});

app.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['public_profile', 'email']
}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/error'
  }));

  app.get('/logout', function (req, res) {
 // req.logout();
 res.clearCookie('user_sid', {path: '/'});
 // req.session.destroy(function (err) {
    req.session = null;
    res.redirect('/');
 // });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}
const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));