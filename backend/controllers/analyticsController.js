const Car = require('../models/Car');
const Dealer = require('../models/Dealer');
const Service = require('../models/Service');
const Accident = require('../models/Accident');

// @desc    Get dashboard overview statistics
// @route   GET /api/analytics/overview
// @access  Public
exports.getOverview = async (req, res, next) => {
    try {
        const [
            totalCars,
            avgPriceResult,
            totalDealers,
            totalServices,
            totalAccidents
        ] = await Promise.all([
            Car.countDocuments(),
            Car.aggregate([
                {
                    $group: {
                        _id: null,
                        avgPrice: { $avg: '$price' },
                        minPrice: { $min: '$price' },
                        maxPrice: { $max: '$price' }
                    }
                }
            ]),
            Dealer.countDocuments(),
            Service.countDocuments(),
            Accident.countDocuments()
        ]);

        res.json({
            success: true,
            data: {
                total_cars: totalCars,
                average_price: Math.round(avgPriceResult[0]?.avgPrice || 0),
                min_price: avgPriceResult[0]?.minPrice || 0,
                max_price: avgPriceResult[0]?.maxPrice || 0,
                total_dealers: totalDealers,
                total_services: totalServices,
                total_accidents: totalAccidents
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get price statistics by manufacturer
// @route   GET /api/analytics/by-manufacturer
// @access  Public
exports.getByManufacturer = async (req, res, next) => {
    try {
        const stats = await Car.aggregate([
            {
                $group: {
                    _id: '$manufacturer',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $project: {
                    _id: 0,
                    manufacturer: '$_id',
                    count: 1,
                    avgPrice: { $round: ['$avgPrice', 2] },
                    minPrice: 1,
                    maxPrice: 1
                }
            }
        ]);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get fuel type distribution
// @route   GET /api/analytics/by-fuel-type
// @access  Public
exports.getByFuelType = async (req, res, next) => {
    try {
        const distribution = await Car.aggregate([
            {
                $group: {
                    _id: '$fuel_type',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $project: {
                    _id: 0,
                    fuel_type: '$_id',
                    count: 1,
                    avgPrice: { $round: ['$avgPrice', 2] }
                }
            }
        ]);

        // Calculate percentages
        const total = await Car.countDocuments();
        const withPercentages = distribution.map(item => ({
            ...item,
            percentage: parseFloat(((item.count / total) * 100).toFixed(2))
        }));

        res.json({
            success: true,
            data: withPercentages
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get service trends over time (half-yearly 2021-2024)
// @route   GET /api/analytics/service-trends
// @access  Public
exports.getServiceTrends = async (req, res, next) => {
    try {
        // Get service trends grouped by half-year periods from 2021 to 2024
        const trends = await Service.aggregate([
            {
                $match: {
                    date_of_service: {
                        $gte: new Date('2021-01-01'),
                        $lte: new Date('2024-12-31')
                    }
                }
            },
            {
                $addFields: {
                    year: { $year: '$date_of_service' },
                    month: { $month: '$date_of_service' }
                }
            },
            {
                $addFields: {
                    halfYear: {
                        $concat: [
                            { $toString: '$year' },
                            '-',
                            { $cond: [{ $lte: ['$month', 6] }, 'H1', 'H2'] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$halfYear',
                    count: { $sum: 1 },
                    totalCost: { $sum: '$cost_of_service' },
                    avgCost: { $avg: '$cost_of_service' }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    month: '$_id',
                    count: 1,
                    totalCost: { $round: ['$totalCost', 2] },
                    avgCost: { $round: ['$avgCost', 2] }
                }
            }
        ]);

        res.json({
            success: true,
            data: trends,
            period: '2021-2024 (half-yearly)'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get accident severity distribution
// @route   GET /api/analytics/accident-severity
// @access  Public
exports.getAccidentSeverity = async (req, res, next) => {
    try {
        const severityStats = await Accident.aggregate([
            {
                $lookup: {
                    from: 'cars',
                    localField: 'car_id',
                    foreignField: 'car_id',
                    as: 'car'
                }
            },
            {
                $unwind: '$car'
            },
            {
                $group: {
                    _id: {
                        manufacturer: '$car.manufacturer',
                        severity: '$severity'
                    },
                    count: { $sum: 1 },
                    avgRepairCost: { $avg: '$cost_of_repair' }
                }
            },
            {
                $sort: {
                    '_id.manufacturer': 1,
                    '_id.severity': 1
                }
            },
            {
                $project: {
                    _id: 0,
                    manufacturer: '$_id.manufacturer',
                    severity: '$_id.severity',
                    count: 1,
                    avgRepairCost: { $round: ['$avgRepairCost', 2] }
                }
            }
        ]);

        res.json({
            success: true,
            data: severityStats
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get mileage vs price data (for scatter plot)
// @route   GET /api/analytics/mileage-price
// @access  Public
exports.getMileagePrice = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 1000;

        const data = await Car.aggregate([
            {
                $sample: { size: limit } // Random sample for performance
            },
            {
                $project: {
                    _id: 0,
                    car_id: 1,
                    manufacturer: 1,
                    model: 1,
                    mileage: '$mileage',
                    price: 1,
                    year: '$year_of_manufacturing',
                    fuel_type: '$fuel_type'
                }
            }
        ]);

        res.json({
            success: true,
            data,
            count: data.length
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get price distribution (histogram data)
// @route   GET /api/analytics/price-distribution
// @access  Public
exports.getPriceDistribution = async (req, res, next) => {
    try {
        const binSize = 20000; // Fixed 20k GBP bins
        const maxBins = 10; // Up to 200k

        // Create fixed boundaries: 0, 10000, 20000, ..., 200000
        const boundaries = Array.from({ length: maxBins + 1 }, (_, i) => i * binSize);

        // Create histogram with fixed 10k bins
        const histogram = await Car.aggregate([
            {
                $bucket: {
                    groupBy: '$price',
                    boundaries: boundaries,
                    default: 'Other',
                    output: {
                        count: { $sum: 1 },
                        avgPrice: { $avg: '$price' }
                    }
                }
            }
        ]);

        // Format data with readable labels
        const formattedData = histogram.map(item => ({
            ...item,
            range: item._id === 'Other' ? '200k+' : `${item._id / 1000}-${(item._id + binSize) / 1000}k`
        }));

        res.json({
            success: true,
            data: formattedData,
            binSize: binSize
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get top dealers by sales volume
// @route   GET /api/analytics/top-dealers
// @access  Public
exports.getTopDealers = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const topDealers = await Car.aggregate([
            {
                $group: {
                    _id: '$dealer_id',
                    totalCars: { $sum: 1 },
                    totalSales: { $sum: '$price' },
                    avgPrice: { $avg: '$price' }
                }
            },
            {
                $lookup: {
                    from: 'dealers',
                    localField: '_id',
                    foreignField: 'dealer_id',
                    as: 'dealer'
                }
            },
            {
                $unwind: '$dealer'
            },
            {
                $sort: { totalSales: -1 }
            },
            {
                $limit: limit
            },
            {
                $project: {
                    _id: 0,
                    dealer_id: '$_id',
                    dealer_name: '$dealer.dealer_name',
                    dealer_city: '$dealer.dealer_city',
                    total_cars: '$totalCars',
                    total_sales: { $round: ['$totalSales', 2] },
                    avg_price: { $round: ['$avgPrice', 2] }
                }
            }
        ]);

        res.json({
            success: true,
            data: topDealers
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get accident trends over time (half-yearly 2021-2024)
// @route   GET /api/analytics/accident-trends
// @access  Public
exports.getAccidentTrends = async (req, res, next) => {
    try {
        // Get accident trends grouped by half-year periods from 2021 to 2024
        const trends = await Accident.aggregate([
            {
                $match: {
                    date_of_accident: {
                        $gte: new Date('2021-01-01'),
                        $lte: new Date('2024-12-31')
                    }
                }
            },
            {
                $addFields: {
                    year: { $year: '$date_of_accident' },
                    month: { $month: '$date_of_accident' }
                }
            },
            {
                $addFields: {
                    halfYear: {
                        $concat: [
                            { $toString: '$year' },
                            '-',
                            { $cond: [{ $lte: ['$month', 6] }, 'H1', 'H2'] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$halfYear',
                    count: { $sum: 1 },
                    totalCost: { $sum: '$cost_of_repair' },
                    avgCost: { $avg: '$cost_of_repair' }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    month: '$_id',
                    count: 1,
                    totalCost: { $round: ['$totalCost', 2] },
                    avgCost: { $round: ['$avgCost', 2] }
                }
            }
        ]);

        res.json({
            success: true,
            data: trends,
            period: '2021-2024 (half-yearly)'
        });
    } catch (error) {
        next(error);
    }
};
