var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('./cors');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
// with admin privilege, this will return the details of all the users
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
  .then((err, users) => {
    if(err) {
      return next(err);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
});

// signup  simplified using passport 
router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {  //after registering, set first&last name
      if (req.body.firstname) {
        user.firstname = req.body.firstname;
      }
      if (req.body.lastname) {
        user.lastname = req.body.lastname;
      }
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        });
      });
    }
  });
});


// login simplified using passport
router.post('/login', cors.corsWithOptions,  passport.authenticate('local'), (req, res) => {
  // here CREATE a TOKEN after Authenticated
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/logout', (req, res) => {
  if(req.session) {
    req.session.destroy();  //remove session from server side
    res.clearCookie('session-id');  // remove from client side
    res.redirect('/'); //redirect to homepage
  } else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

// when get req is called, authenticate using 'facebook-token' strategy
router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if(req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

module.exports = router;
 