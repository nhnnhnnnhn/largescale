const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
    dealer_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        index: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere' // Geospatial index
        }
    },
    contact: {
        phone: String,
        email: String
    },
    statistics: {
        total_cars: {
            type: Number,
            default: 0
        },
        average_price: {
            type: Number,
            default: 0
        }
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Geospatial index for location-based queries
dealerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Dealer', dealerSchema, 'dealers');
