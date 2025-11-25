const express = require('express');
const router = express.Router();
const {
    getAllDealers,
    getDealerById,
    getDealerInventory,
    getNearbyDealers
} = require('../controllers/dealerController');

// @route   GET /api/dealers/nearby
// Must be before /:id to avoid conflict
router.get('/nearby', getNearbyDealers);

// @route   GET /api/dealers
router.get('/', getAllDealers);

// @route   GET /api/dealers/:id/inventory
router.get('/:id/inventory', getDealerInventory);

// @route   GET /api/dealers/:id
router.get('/:id', getDealerById);

module.exports = router;
