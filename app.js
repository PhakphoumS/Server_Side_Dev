// To scaffold out an Express application using the express-generator
// Generating an Express application using the express-generator
// npm install express-generator@4.16.0 -g
// Scaffolding an Express Application
// express conFusionServer      
// npm install
// npm start

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');  //session
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');
var favRouter = require('./routes/favRouter');

var app = express();
app.all('*', (req, res, next) => {//for all request coming in, redirect to..
  if(req.secure) {
    return next();
  } else {
    res.redirect(307,'https://'+ req.hostname + ':'+ app.get('secPort')+ req.url);
    //req.url here contains the rest of part except hostname and port no.
  }
});

// from mongoose 
const mongoose = require('mongoose');
const Dishes = require('./models/dishes');
const Promotions = require('./models/promotions')
const Leaders = require('./models/leaders');

const url = config.mongoUrl;
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

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

// configure END points
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favRouter);

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
