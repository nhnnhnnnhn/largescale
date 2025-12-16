const mongoose = require('mongoose');

const accidentSchema = new mongoose.Schema({
    accident_id: {
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
    date_of_accident: {
        type: String, // YYYY-MM-DD format
        required: true,
        index: true
    },
    description: String,
    severity: {
        type: String,
        enum: ['Minor', 'Moderate', 'Major', 'Severe'],
        index: true
    },
    cost_of_repair: {
        type: Number,
        required: true
    }
});

// Compound index for car accident history queries
accidentSchema.index({ car_id: 1, date_of_accident: -1 });
// Index for severity analysis
accidentSchema.index({ severity: 1, cost_of_repair: -1 });

module.exports = mongoose.model('Accident', accidentSchema, 'accidents');
