// using this file to store authentication strategies
// npm install passport-jwt@4.0.0 jsonwebtoken@8.3.0 --save

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var FacebookTokenStrategy = require('passport-facebook-token');
var config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    //help us to create jwt and supply a payload
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

// new JwtStrategy(options, verify)  authentication strategy
exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT payload: ", jwt_payload);
    User.findOne({_id: jwt_payload._id}, (err, user) => { 
        if(err) { //call back which passport will pass into your strategy (done) on top
            return done(err, false);   
        }
        else if (user) {
            return done(null, user);
        }
        else {
            // can't find user pass in false
            return done(null, false);
        }
    });
}));

//jwt strategy stores the req.user   
exports.verifyUser = passport.authenticate('jwt', {session: false}); 

// check for admin privileges
exports.verifyAdmin = (req, res, next) => {
    if(req.user.admin) {
        next();
    } else {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
};

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
    }, (accessToken, refreshToken, profile, done) => { //4 cb func
        User.findOne({facebookId: profile.id}, (err, user) => {
            if(err) {
                return done(err, false);
            }
            if(!err && user !== null) {
                return done(null, user);
            } 
            else {
                user = new User({username: profile.displayName});
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err,user) => {
                    if(err) {
                        return done(err, false);
                    } else {
                        return done(null, user);
                    }
                });
            }
        });
    }
));