require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// CORS Middleware - Allow all origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'Car Sales Dashboard',
        version: '1.0.0',
        status: 'active',
        endpoints: {
            cars: '/api/cars',
            dealers: '/api/dealers',
            analytics: '/api/analytics'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        mongodb: 'connected',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/cars', require('./routes/cars'));
app.use('/api/dealers', require('./routes/dealers'));
app.use('/api/analytics', require('./routes/analytics'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: {
            message: err.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found'
        }
    });
});

const PORT = process.env.PORT;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`\nServer running in ${process.env.NODE_ENV} mode on ${HOST}:${PORT}`);
    console.log(`API: http://localhost:${PORT}`);
    console.log(`Frontend: ${process.env.CLIENT_URL}\n`);
});
