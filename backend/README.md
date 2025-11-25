# Car Sales Dashboard - Backend API

## 📋 Tổng Quan

Đây là backend API cho Car Sales Interactive Dashboard, được xây dựng với Node.js, Express, và MongoDB. API cung cấp các endpoints để truy xuất và phân tích dữ liệu xe hơi, đại lý, dịch vụ bảo dưỡng và tai nạn.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js v20+
- **Framework**: Express.js v4.18
- **Database**: MongoDB với Mongoose ODM
- **CORS**: Hỗ trợ cross-origin requests từ frontend
- **Logging**: Morgan (development logging)
- **Environment**: dotenv (quản lý biến môi trường)

---

## 📁 Cấu Trúc Dự Án

```
backend/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── models/
│   ├── Car.js                # Car schema với embedded summaries
│   ├── Dealer.js             # Dealer schema với GeoJSON location
│   ├── Service.js            # Service records
│   └── Accident.js           # Accident records
├── routes/                   # API routes (sẽ tạo tiếp)
├── controllers/              # Request handlers (sẽ tạo tiếp)
├── middleware/               # Custom middleware (sẽ tạo tiếp)
├── .env                      # Environment variables (local)
├── .env.example              # Environment template
├── .gitignore                # Git ignore file
├── package.json              # Dependencies & scripts
└── server.js                 # Entry point
```

---

## 🚀 Những Gì Đã Làm

### 1. **Khởi Tạo Project** ✅

**File**: `package.json`

Đã tạo npm project với các dependencies:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `morgan` - HTTP request logger
- `nodemon` (dev) - Auto-restart server

**Scripts có sẵn**:
```bash
npm start         # Chạy production mode
npm run dev       # Chạy development mode với nodemon
```

---

### 2. **MongoDB Connection** ✅

**File**: `config/db.js`

**Chức năng**:
- Kết nối async với MongoDB
- Error handling và retry logic
- Event listeners cho connection events
- Logging khi kết nối thành công/thất bại

**Code highlights**:
```javascript
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Event listeners
    mongoose.connection.on('disconnected', () => {...});
    mongoose.connection.on('error', (err) => {...});
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};
```

**Kết quả**: Server tự động kết nối MongoDB khi khởi động

---

### 3. **Express Server Setup** ✅

**File**: `server.js`

**Middleware đã cấu hình**:
1. **CORS**: Cho phép requests từ `http://localhost:5173` (frontend)
2. **JSON Parser**: `express.json()` để xử lý JSON requests
3. **URL Encoded**: `express.urlencoded()` cho form data
4. **Morgan Logger**: Log HTTP requests ở development mode

**Endpoints hiện có**:
- `GET /` - API info và available endpoints
- `GET /health` - Health check (kiểm tra server + MongoDB status)

**Error Handling**:
- Global error handler middleware
- 404 handler cho routes không tồn tại
- Trả về JSON error responses chuẩn

**Response Format**:
```javascript
// Success
{
  message: "...",
  data: {...}
}

// Error
{
  success: false,
  error: {
    message: "...",
    stack: "..." // chỉ ở development mode
  }
}
```

---

### 4. **Mongoose Models** ✅

#### **Model: Car** (`models/Car.js`)

**Schema Structure**:
```javascript
{
  car_id: String (unique, indexed),
  manufacturer: String (indexed),
  model: String,
  specifications: {
    engine_size: Number,
    fuel_type: String (enum: Petrol/Diesel/Hybrid, indexed),
    year_of_manufacturing: Number (indexed),
    mileage: Number
  },
  price: Number (indexed),
  features: [String],
  dealer_id: String (reference to Dealer),
  
  // EMBEDDED SUMMARIES (Hybrid Pattern)
  service_summary: {
    total_services: Number,
    last_service_date: String,
    total_cost: Number,
    last_service_type: String
  },
  accident_summary: {
    total_accidents: Number,
    last_accident_date: String,
    total_repair_cost: Number,
    highest_severity: String
  },
  
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
- Single: `car_id`, `manufacturer`, `price`, `fuel_type`, `year`, `dealer_id`
- Compound: `{manufacturer: 1, model: 1}`, `{price: 1, year: -1}`

**Lý do**: Embedded summaries giúp queries nhanh hơn (không cần JOIN)

---

#### **Model: Dealer** (`models/Dealer.js`)

**Schema Structure**:
```javascript
{
  dealer_id: String (unique, indexed),
  name: String,
  city: String (indexed),
  
  // GeoJSON for geospatial queries
  location: {
    type: "Point",
    coordinates: [longitude, latitude]  // [lng, lat] QUAN TRỌNG!
  },
  
  contact: {
    phone: String,
    email: String
  },
  statistics: {
    total_cars: Number,
    average_price: Number
  },
  created_at: Date
}
```

**Indexes**:
- `dealer_id` (unique)
- `location` (2dsphere) - Cho geospatial queries
- `city`

**Geospatial Queries**:
```javascript
// Tìm dealers trong bán kính 10km
db.dealers.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: 10000
    }
  }
});
```

---

#### **Model: Service** (`models/Service.js`)

**Schema Structure**:
```javascript
{
  service_id: String (unique, indexed),
  car_id: String (reference, indexed),
  date: String (YYYY-MM-DD, indexed),
  type: String (indexed),
  cost: Number,
  details: {
    mileage_at_service: Number,
    technician: String,
    items_replaced: [String],
    next_service_due: String
  },
  created_at: Date
}
```

**Indexes**:
- `service_id`
- `car_id`
- `date`
- `type`
- Compound: `{car_id: 1, date: -1}` (cho service history queries)

---

#### **Model: Accident** (`models/Accident.js`)

**Schema Structure**:
```javascript
{
  accident_id: String (unique, indexed),
  car_id: String (reference, indexed),
  date: String (YYYY-MM-DD, indexed),
  description: String,
  severity: String (enum: Minor/Moderate/Major/Severe, indexed),
  cost_of_repair: Number,
  details: {
    location: String,
    insurance_claim: Boolean,
    claim_number: String,
    repaired: Boolean,
    repair_completion_date: String
  },
  created_at: Date
}
```

**Indexes**:
- `accident_id`
- `car_id`
- `date`
- `severity`
- Compound: `{car_id: 1, date: -1}`, `{severity: 1, cost_of_repair: -1}`

---

### 5. **Environment Variables** ✅

**File**: `.env`

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/carsales
CLIENT_URL=http://localhost:5173
```

**File**: `.env.example` (template cho version control)

**Lưu ý**: `.env` đã được thêm vào `.gitignore` để bảo mật

---

## 📊 Database Schema Design

### Hybrid Pattern Strategy

**Câu hỏi**: Tại sao không embed tất cả services/accidents vào Car document?

**Trả lời**:
1. **Size Limit**: MongoDB documents có giới hạn 16MB
2. **Performance**: Embedding 17K services + 22K accidents sẽ làm chậm queries
3. **Flexibility**: Separate collections cho phép queries độc lập

**Giải pháp Hybrid Pattern**:
- ✅ **Embed summaries** trong Car (total_services, last_service_date, etc.)
  - Queries nhanh: `db.cars.find({ "service_summary.total_services": { $gt: 3 } })`
  - Không cần JOIN
- ✅ **Separate collections** cho detailed records
  - Analytics queries: `db.services.aggregate([...])`
  - Không làm phình Car documents

**Kết quả**: Best of both worlds - fast reads + flexible analytics

---

## 🔌 API Endpoints (Sẽ Implement Tiếp)

### Đã có:
- ✅ `GET /` - API info
- ✅ `GET /health` - Health check

### Sẽ tạo tiếp (Phase 1 - Day 2):
- `GET /api/cars` - List cars (paginated)
- `GET /api/cars/:id` - Get car details
- `GET /api/cars/:id/history` - Full service + accident history
- `GET /api/dealers` - List dealers
- `GET /api/dealers/nearby?lat=x&lng=y` - Geospatial search
- `GET /api/analytics/overview` - Dashboard stats
- `GET /api/analytics/by-manufacturer` - Price by manufacturer
- `GET /api/analytics/by-fuel-type` - Fuel distribution
- `GET /api/analytics/service-trends` - Service trends over time

---

## 🧪 Testing

### Test Server Running

```bash
# Terminal 1: Start MongoDB (nếu chưa chạy)
mongod

# Terminal 2: Start backend
cd backend
npm install
npm run dev
```

**Expected Output**:
```
✅ MongoDB Connected: localhost
📊 Database: carsales
🚀 Server running in development mode on port 5000
📍 API: http://localhost:5000
🔗 Frontend: http://localhost:5173
```

### Test Endpoints

```bash
# Test API info
curl http://localhost:5000/

# Test health check
curl http://localhost:5000/health
```

**Expected Response** (`GET /`):
```json
{
  "message": "🚗 Car Sales Dashboard API",
  "version": "1.0.0",
  "status": "active",
  "endpoints": {
    "cars": "/api/cars",
    "dealers": "/api/dealers",
    "analytics": "/api/analytics"
  }
}
```

---

## ⚙️ Configuration

### MongoDB Connection String

**Format**: `mongodb://localhost:27017/carsales`

**Database**: `carsales` (đã import ở Activity 1)

**Collections**:
- `cars` (15,000 documents)
- `dealers` (50 documents)
- `services` (17,977 documents)
- `accidents` (22,707 documents)

**Kiểm tra data đã import**:
```bash
# MongoDB shell
mongosh
use carsales
db.cars.countDocuments()      # Should return 15000
db.dealers.countDocuments()   # Should return 50
```

---

## 🔒 Security

### CORS Configuration
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,  // Only allow frontend
  credentials: true
}));
```

### Environment Variables
- ❌ Không commit `.env` vào Git
- ✅ Dùng `.env.example` làm template
- ✅ Sensitive data (DB passwords) nên lưu trong `.env`

---

## ✅ Phase 1 Day 2 - API Routes & Controllers (COMPLETE!)

### Controllers Created (3 files)

#### 1. **`controllers/carController.js`** - 4 methods
- `getAllCars()` - GET /api/cars - Pagination + sorting
- `getCarById()` - GET /api/cars/:id - Single car details
- `searchCars()` - POST /api/cars/search - Advanced filtering (manufacturers, price, year, fuel, features, services, accidents)
- `getCarHistory()` - GET /api/cars/:id/history - Complete service + accident history

#### 2. **`controllers/dealerController.js`** - 4 methods
- `getAllDealers()` - GET /api/dealers - List all dealers
- `getDealerById()` - GET /api/dealers/:id - Single dealer
- `getDealerInventory()` - GET /api/dealers/:id/inventory - Dealer's cars (paginated)
- `getNearbyDealers()` - GET /api/dealers/nearby - **Geospatial query** (lat, lng, maxDistance)

#### 3. **`controllers/analyticsController.js`** - 8 methods (MongoDB aggregations)
- `getOverview()` - GET /api/analytics/overview - Dashboard stats (total cars, avg price, dealers, services, accidents)
- `getByManufacturer()` - GET /api/analytics/by-manufacturer - Price stats by manufacturer
- `getByFuelType()` - GET /api/analytics/by-fuel-type - Fuel distribution with percentages
- `getServiceTrends()` - GET /api/analytics/service-trends?months=24 - Time series data
- `getAccidentSeverity()` - GET /api/analytics/accident-severity - Severity by manufacturer
- `getMileagePrice()` - GET /api/analytics/mileage-price - Scatter plot data
- `getPriceDistribution()` - GET /api/analytics/price-distribution?bins=10 - Histogram
- `getTopDealers()` - GET /api/analytics/top-dealers?limit=10 - Top dealers by sales

### Routes Created (3 files)

- ✅ `routes/cars.js` - 4 endpoints
- ✅ `routes/dealers.js` - 4 endpoints
- ✅ `routes/analytics.js` - 8 endpoints

### Server Updated
- ✅ Routes connected to Express app in `server.js`

### **Total: 16 API Endpoints Ready!**

---

## 🧪 Test API với Postman hoặc curl

### Start Server
```bash
npm run dev
# Server: http://localhost:5001
```

### Test Endpoints

**Dashboard Overview:**
```bash
curl http://localhost:5001/api/analytics/overview
```

**Get Cars (paginated):**
```bash
curl "http://localhost:5001/api/cars?page=1&limit=10&sort=price"
```

**Search Cars:**
```bash
curl -X POST http://localhost:5001/api/cars/search \
  -H "Content-Type: application/json" \
  -d '{"manufacturers":["Toyota"],"priceMax":50000}'
```

**Nearby Dealers (geospatial):**
```bash
curl "http://localhost:5001/api/dealers/nearby?lat=53.713263&lng=0.738007&maxDistance=10000"
```

**Service Trends:**
```bash
curl http://localhost:5001/api/analytics/service-trends?months=12
```

---

## 📝 Next Steps (Phase 2 - Frontend)

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution**:
```bash
# Check MongoDB is running
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

---

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## ✅ Checklist Hoàn Thành

### Phase 1 - Day 1 ✅
- [x] Create backend directory
- [x] Initialize npm project
- [x] Install dependencies (express, mongoose, dotenv, cors, morgan)
- [x] Create .env file
- [x] Setup Express server
- [x] Create MongoDB connection config
- [x] Create Mongoose models (Car, Dealer, Service, Accident)
- [x] Define schemas with indexes
- [x] Test server runs successfully
- [x] Test MongoDB connection works

### Phase 1 - Day 2 ✅
- [x] Create 3 controllers (16 methods total)
  - [x] carController.js (4 methods)
  - [x] dealerController.js (4 methods)
  - [x] analyticsController.js (8 methods)
- [x] Create 3 route files
  - [x] routes/cars.js
  - [x] routes/dealers.js
  - [x] routes/analytics.js
- [x] Connect routes to Express server
- [x] Test all endpoints

**Status**: ✅ Phase 1 COMPLETE! Backend API Ready!

**Next**: Phase 2 - Frontend Setup (React + Vite + MUI + Recharts)

---

## 📊 API Summary

**Endpoints Implemented**: 16  
**Controllers**: 3  
**Routes**: 3  
**MongoDB Models**: 4

**Ready for frontend integration!** 🚀

---

**Last Updated**: November 2025  
**Author**: Car Sales Dashboard Team  
**Version**: 1.0.0
