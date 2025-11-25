const express = require('express');
const router = express.Router();
const {
    getAllCars,
    getCarById,
    searchCars,
    getCarHistory
} = require('../controllers/carController');

// @route   GET /api/cars
router.get('/', getAllCars);

// @route   POST /api/cars/search
router.post('/search', searchCars);

// @route   GET /api/cars/:id/history
router.get('/:id/history', getCarHistory);

// @route   GET /api/cars/:id
// Must be last to avoid conflict with /search and /:id/history
router.get('/:id', getCarById);

module.exports = router;
