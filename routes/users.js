var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('./cors');
const user = require('../models/user');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
// with admin privilege, this will return the details of all the users
router.options('*', cors.corsWithOptions, (req, res) => {res.sendStatus(200); });

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
    req.body.password, (err, user) => { //assigned password which turns into hash and salt
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
router.post('/login', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => { //for local authentication
    // if authenticate cannot find user or password is incorrect
    // display meaningful error and encode error message in 'info' to client side
    if (err) return next(err);

    if(!user) { //if user does not exist , pass back error info
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, status: 'Login Unsuccessful!!', err: info});
    }
    //successful
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, status: 'Login Unsuccessful!!', err: 'Could not log in user'});
      } 
      // here CREATE a TOKEN after Authenticated
      var token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Login Successful!!', token: token});
    });
  }) (req, res, next);
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

router.get('/checkJWTToken', cors.corsWithOptions, (req, res) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => { //for jwt authentication
    if (err) return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({success: false, status: 'JWT Invalid!', err: info});
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({success: true, status: 'JWT valid!', user: user});
 
    }
  }) (req, res);
});

module.exports = router;
 