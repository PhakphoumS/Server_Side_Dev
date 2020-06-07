const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const multer= require('multer');
/**
 * configure type of storage for multer 
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

/**
 * Configure file filter for multer
 */
const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

/**
 * Configure multer module which takes in 2 parameter, 
 * storage and filefilter
 */
const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();
uploadRouter.use(bodyParser.json());

uploadRouter.route('/') //only allow 'post' method
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not suppported on /imageUpload');
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), 
(req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json(req.file); //parse file back to client, contains path of file
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not suppported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not suppported on /imageUpload');
});


module.exports = uploadRouter;