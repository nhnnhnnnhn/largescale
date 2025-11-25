const Dealer = require('../models/Dealer');
const Car = require('../models/Car');

// @desc    Get all dealers
// @route   GET /api/dealers
// @access  Public
exports.getAllDealers = async (req, res, next) => {
    try {
        const dealers = await Dealer.find().select('-__v');

        res.json({
            success: true,
            data: dealers,
            count: dealers.length
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single dealer by ID
// @route   GET /api/dealers/:id
// @access  Public
exports.getDealerById = async (req, res, next) => {
    try {
        const dealer = await Dealer.findOne({ dealer_id: req.params.id })
            .select('-__v');

        if (!dealer) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Dealer not found',
                    code: 'DEALER_NOT_FOUND'
                }
            });
        }

        res.json({
            success: true,
            data: dealer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get dealer inventory (cars)
// @route   GET /api/dealers/:id/inventory
// @access  Public
exports.getDealerInventory = async (req, res, next) => {
    try {
        const dealerId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Check if dealer exists
        const dealer = await Dealer.findOne({ dealer_id: dealerId });
        if (!dealer) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Dealer not found',
                    code: 'DEALER_NOT_FOUND'
                }
            });
        }

        // Get cars for this dealer
        const cars = await Car.find({ dealer_id: dealerId })
            .skip(skip)
            .limit(limit)
            .select('-__v');

        const total = await Car.countDocuments({ dealer_id: dealerId });

        res.json({
            success: true,
            data: {
                dealer: {
                    dealer_id: dealer.dealer_id,
                    name: dealer.name,
                    city: dealer.city
                },
                cars,
                metadata: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Find nearby dealers (geospatial query)
// @route   GET /api/dealers/nearby
// @access  Public
exports.getNearbyDealers = async (req, res, next) => {
    try {
        const { lat, lng, maxDistance } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Latitude and longitude are required',
                    code: 'MISSING_COORDINATES'
                }
            });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const distance = parseInt(maxDistance) || 10000; // Default 10km

        // MongoDB geospatial query
        const dealers = await Dealer.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude] // [lng, lat] order!
                    },
                    $maxDistance: distance
                }
            }
        }).select('-__v');

        res.json({
            success: true,
            data: dealers,
            query: {
                center: { latitude, longitude },
                maxDistance: distance,
                found: dealers.length
            }
        });
    } catch (error) {
        next(error);
    }
};
