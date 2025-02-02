const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//to use currency, require it.
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

// here for commentSchema, adding sub-document to document
// and adding to dishSchema
var commentSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:  {
        type: String,
        required: true
    },
    author:  { //using 'mongoose population' instead of string
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'   //reference to 'User Model'
    }
}, {
    timestamps: true
});

var dishSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default:false      
    },
    comments:[commentSchema]
}, {
    timestamps: true
});

var Dishes = mongoose.model('Dish', dishSchema);

module.exports = Dishes;