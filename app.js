// To scaffold out an Express application using the express-generator
// Generating an Express application using the express-generator
// npm install express-generator@4.16.0 -g
// Scaffolding an Express Application
// express conFusionServer      
// npm install
//npm start

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var app = express();

// from mongoose 
const mongoose = require('mongoose');
const Dishes = require('./models/dishes');
const Promotions = require('./models/promotions')
const Leaders = require('./models/leaders');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url, {useNewUrlParser: true});

connect.then((db) => {
  console.log('Connected correctly to the server');
}, (err) => {
  console.log(err);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//check for auth before displaying
function auth(req, res, next) {
  console.log(req.headers);

  var authHeader = req.headers.authorization;
  if(!authHeader) {
    var err = new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err);
  }
  //split on empty space. 'Basic ALSDJ3#135lk'
  //take only the encoded auth which is 'username:password' 
  var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':');
  var username = auth[0];
  var password = auth[1];

  if (username === 'admin' && password === 'password') {
    next();
  } 
  else {
    var err = new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err);
  }
}
app.use(auth)

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
