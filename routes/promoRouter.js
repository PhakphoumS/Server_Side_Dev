// handling different REST API endpoints using Express Router

const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

// promotions
promoRouter.route('/')
.all((req,res,next) => {
    res.writeHead(200, {'Content-Type':'text/plain'});
    next();    // continue to look for additional specs down which will match '/promotions' end point
})
.get((req,res,next) => {
    res.end('Will send all the promotions to you!');
})
.post((req, res, next) => {
    res.end('Will add the promotions: ' + req.body.name + ' with details: ' + req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
})
.delete((req, res, next) => {
    res.end('Deleting all promotions');
});


// promotions/:promoId
promoRouter.route('/:promoId')
.get((req, res, next) => {
    res.end('Will send all the promotions: ' + req.params.promoId + ' to you!');
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/' + req.params.promoId);
})
.put((req, res, next) => {
    res.write('Updating the promotions: ' + req.params.promoId + '\n');
    res.end('Will update the promotions: ' + req.body.name + ' with details: ' +req.body.description);
})
.delete((req, res, next) => {
    res.end('Deleting promotions: ' + req.params.promoId);
});


module.exports = promoRouter;