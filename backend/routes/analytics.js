const express = require('express');
const router = express.Router();
const {
    getOverview,
    getByManufacturer,
    getByFuelType,
    getServiceTrends,
    getAccidentSeverity,
    getMileagePrice,
    getPriceDistribution,
    getTopDealers
} = require('../controllers/analyticsController');

// @route   GET /api/analytics/overview
router.get('/overview', getOverview);

// @route   GET /api/analytics/by-manufacturer
router.get('/by-manufacturer', getByManufacturer);

// @route   GET /api/analytics/by-fuel-type
router.get('/by-fuel-type', getByFuelType);

// @route   GET /api/analytics/service-trends
router.get('/service-trends', getServiceTrends);

// @route   GET /api/analytics/accident-severity
router.get('/accident-severity', getAccidentSeverity);

// @route   GET /api/analytics/mileage-price
router.get('/mileage-price', getMileagePrice);

// @route   GET /api/analytics/price-distribution
router.get('/price-distribution', getPriceDistribution);

// @route   GET /api/analytics/top-dealers
router.get('/top-dealers', getTopDealers);

module.exports = router;
