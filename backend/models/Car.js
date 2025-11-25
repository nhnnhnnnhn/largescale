const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    car_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    manufacturer: {
        type: String,
        required: true,
        index: true
    },
    model: {
        type: String,
        required: true
    },
    specifications: {
        engine_size: Number,
        fuel_type: {
            type: String,
            enum: ['Petrol', 'Diesel', 'Hybrid'],
            index: true
        },
        year_of_manufacturing: {
            type: Number,
            index: true
        },
        mileage: Number
    },
    price: {
        type: Number,
        required: true,
        index: true
    },
    features: [String],
    dealer_id: {
        type: String,
        ref: 'Dealer',
        index: true
    },
    service_summary: {
        total_services: {
            type: Number,
            default: 0
        },
        last_service_date: String,
        total_cost: {
            type: Number,
            default: 0
        },
        last_service_type: String
    },
    accident_summary: {
        total_accidents: {
            type: Number,
            default: 0
        },
        last_accident_date: String,
        total_repair_cost: {
            type: Number,
            default: 0
        },
        highest_severity: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Compound indexes for common queries
carSchema.index({ manufacturer: 1, model: 1 });
carSchema.index({ price: 1, 'specifications.year_of_manufacturing': -1 });

module.exports = mongoose.model('Car', carSchema, 'cars');
