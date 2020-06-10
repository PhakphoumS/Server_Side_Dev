const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');

const favRouter = express.Router();
favRouter.use(bodyParser.json());

favRouter.route('/')
.options(cors.corsWithOptions,(req,res) =>{ res.sendStatus(200); })
// handles GET to /favorites
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({ user: req.user._id})
    .populate('user')
    .populate('dishes')
    .exec((err, favorites) => {
        if(err) { return next(err);}
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    });
})
// handles POST to /favorites
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    // check whether this dish has already been added to favorite
    Favorites.findOne({user: req.user._id}, (err, favorite) =>{
        if(err) return next(err); 

        if(!favorite) {
            Favorites.create({ user: req.user._id})
            .then((favorite) => {
                for(dish = 0; dish < req.body.length; dish++) {
                    if (favorite.dish.indexOf(req.body[dish]._id) )
                        favorite.dish.push(req.body[i]); 
                }
                favorite.save()  
                .then((favorite) => {
                    console.log('Favorite Created ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch((err) => {
                    return next(err);
                });
            })
            .catch((err) => {
                return next(err);
            })
        } 
        else {
            for(dish = 0; dish < req.body.length; dish++) { 
                if(favorite.dishes.indexOf(req.body[dish]._id) < 0) {
                    favorite.dishes.push(req.body[dish]);
                }
            }   
            favorite.save()
            .then((favorite) =>{
                console.log('Favorite Dish added! ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch((err) => {
                return next(err);
            });
        }
    });
})
// handle PUT to /favorites
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`PUT operation not supported on /dishes`);
})
// handles DELETE to /favorites
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Favorites.findOneAndRemove({user: req.user._id}, (err, resp) => {
        if(err) return next(err);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    });
});

// handles all request to /favorites/:dishId
favRouter.route('/:dishId')
.options(cors.corsWithOptions, (req,res) =>{ res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
// handles POST to /favorites/:dishId
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    // check whether this dish has already been added to favorite
    Favorites.findOne({user: req.user._id}, (err, favorite) => {
        if(err) return next(err); 

        if(!favorite){
            Favorites.create({ user: req.user._id})
            .then((favorite) => {
                favorite.dishes.push({ "_id":req.params.dishId});
                favorite.save()
                .then((favorite) =>{
                    console.log('favorite Created ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch((err) => {
                    return next(err);
                });
            }) 
            .catch((err) => {
                return next(err);
            })
        }
        else{
            if(favorite.dishes.indexOf(req.params.dishId) < 0){
                favorite.dishes.push({"_id": req.params.dishId});
                favorite.save()
                .then((favorite) =>{
                    console.log('Favorite Dish added! ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch((err) => {
                    return next(err);
                })
            } 
            else {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Dish ' + req.params.dishId + " already added!!");
            }
        }
    });
})
// handle PUT to /favorites/:dishId
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favorites');
})
// handles DELETE to /favorites/:dishId
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Favorites.findOne({user: req.user._id}, (err,favorite) => {
        if(err) return next(err);

        if(!favorite) {
            res.statusCode = 200;
            res.end("No favorite to delete");
        }
        var index = favorite.dishes.indexOf(req.params.dishId);
        if(index >= 0) {
            favorite.dishes.splice(index, 1);
            favorite.save()
            .then((favorite) => {
                console.log('Favorite Dish Deleted!', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch((err) => {
                return next(err);
            })
        }
        else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Dish ' + req.params._id + ' not in your favorite');
        }
    });
});

module.exports = favRouter;