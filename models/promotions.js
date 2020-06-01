const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//to use currency, require it.
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

// does not require comments for Promotions

var promotionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: ''
    }, 
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

var Promotions = mongoose.model('Promotion', promotionSchema);

module.exports = Promotions;