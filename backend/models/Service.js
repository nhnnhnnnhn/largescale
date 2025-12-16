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
    date_of_service: {
        type: String, // YYYY-MM-DD format
        required: true,
        index: true
    },
    service_type: {
        type: String,
        required: true,
        index: true
    },
    cost_of_service: {
        type: Number,
        required: true
    }
});

// Compound index for car service history queries
serviceSchema.index({ car_id: 1, date_of_service: -1 });

module.exports = mongoose.model('Service', serviceSchema, 'services');
