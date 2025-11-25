const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    service_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    car_id: {
        type: String,
        ref: 'Car',
        required: true,
        index: true
    },
    date: {
        type: String, // YYYY-MM-DD format
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        index: true
    },
    cost: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Compound index for car service history queries
serviceSchema.index({ car_id: 1, date: -1 });

module.exports = mongoose.model('Service', serviceSchema, 'services');
