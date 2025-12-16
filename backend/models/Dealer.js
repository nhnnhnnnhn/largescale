const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
    dealer_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    dealer_name: {
        type: String,
        required: true
    },
    dealer_city: {
        type: String,
        index: true
    },
    latitude: Number,
    longitude: Number
});

// Index for city queries
dealerSchema.index({ dealer_city: 1 });

module.exports = mongoose.model('Dealer', dealerSchema, 'dealers');
