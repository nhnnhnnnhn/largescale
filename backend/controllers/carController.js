const Car = require('../models/Car');
const Service = require('../models/Service');
const Accident = require('../models/Accident');

// @desc    Get all cars (paginated)
// @route   GET /api/cars
// @access  Public
exports.getAllCars = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sort = req.query.sort || 'car_id';
        const order = req.query.order === 'desc' ? -1 : 1;

        const skip = (page - 1) * limit;

        // Build sort object
        const sortObj = {};
        sortObj[sort] = order;

        // Execute query
        const cars = await Car.find()
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .select('-__v');

        const total = await Car.countDocuments();

        res.json({
            success: true,
            data: cars,
            metadata: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single car by ID
// @route   GET /api/cars/:id
// @access  Public
exports.getCarById = async (req, res, next) => {
    try {
        const car = await Car.findOne({ car_id: req.params.id })
            .select('-__v');

        if (!car) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Car not found',
                    code: 'CAR_NOT_FOUND'
                }
            });
        }

        res.json({
            success: true,
            data: car
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Advanced car search with filters
// @route   POST /api/cars/search
// @access  Public
exports.searchCars = async (req, res, next) => {
    try {
        const {
            manufacturers,
            priceMin,
            priceMax,
            yearMin,
            yearMax,
            fuelTypes,
            features,
            dealerCity,
            minServices,
            maxAccidents
        } = req.body;

        // Build query
        const query = {};

        if (manufacturers && manufacturers.length > 0) {
            query.manufacturer = { $in: manufacturers };
        }

        if (priceMin !== undefined || priceMax !== undefined) {
            query.price = {};
            if (priceMin !== undefined) query.price.$gte = priceMin;
            if (priceMax !== undefined) query.price.$lte = priceMax;
        }

        if (yearMin !== undefined || yearMax !== undefined) {
            query['specifications.year_of_manufacturing'] = {};
            if (yearMin !== undefined) query['specifications.year_of_manufacturing'].$gte = yearMin;
            if (yearMax !== undefined) query['specifications.year_of_manufacturing'].$lte = yearMax;
        }

        if (fuelTypes && fuelTypes.length > 0) {
            query['specifications.fuel_type'] = { $in: fuelTypes };
        }

        if (features && features.length > 0) {
            query.features = { $all: features };
        }

        if (minServices !== undefined) {
            query['service_summary.total_services'] = { $gte: minServices };
        }

        if (maxAccidents !== undefined) {
            query['accident_summary.total_accidents'] = { $lte: maxAccidents };
        }

        // Execute query with pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const cars = await Car.find(query)
            .skip(skip)
            .limit(limit)
            .select('-__v');

        const total = await Car.countDocuments(query);

        res.json({
            success: true,
            data: cars,
            metadata: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                filters: req.body
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get complete service and accident history for a car
// @route   GET /api/cars/:id/history
// @access  Public
exports.getCarHistory = async (req, res, next) => {
    try {
        const carId = req.params.id;

        // Get car details
        const car = await Car.findOne({ car_id: carId }).select('-__v');

        if (!car) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Car not found',
                    code: 'CAR_NOT_FOUND'
                }
            });
        }

        // Get all services for this car
        const services = await Service.find({ car_id: carId })
            .sort({ date: -1 })
            .select('-__v');

        // Get all accidents for this car
        const accidents = await Accident.find({ car_id: carId })
            .sort({ date: -1 })
            .select('-__v');

        res.json({
            success: true,
            data: {
                car,
                service_history: services,
                accident_history: accidents,
                summary: {
                    total_services: services.length,
                    total_service_cost: services.reduce((sum, s) => sum + s.cost, 0),
                    total_accidents: accidents.length,
                    total_repair_cost: accidents.reduce((sum, a) => sum + a.cost_of_repair, 0)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
