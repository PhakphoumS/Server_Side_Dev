// handling different REST API endpoints using Express Router

const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

//leaders
leaderRouter.route('/')
.all((req,res,next) => {
    res.writeHead(200, {'Content-Type':'text/plain'});
    next();    // continue to look for additional specs down which will match '/promotions' end point
})
.get((req,res,next) => {
    res.end('Will send all the leaders to you!');
})
.post((req, res, next) => {
    res.end('Will add the leaders: ' + req.body.name + ' with details: ' + req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /leaders');
})
.delete((req, res, next) => {
    res.end('Deleting all leaders');
});

//leaders/:leaderId
leaderRouter.route('/:leaderId')
.get((req, res, next) => {
    res.end('Will send all the leaders: ' + req.params.leaderId + ' to you!');
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /leaders/' + req.params.leaderId);
})
.put((req, res, next) => {
    res.write('Updating the leaders: ' + req.params.leaderId + '\n');
    res.end('Will update the leaders: ' + req.body.name + ' with details: ' +req.body.description);
})
.delete((req, res, next) => {
    res.end('Deleting leaders: ' + req.params.leaderId);
});


module.exports = leaderRouter;