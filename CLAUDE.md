# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Car Sales Dashboard - A full-stack application for analyzing car sales data using MongoDB as the database. The project consists of:
- **Backend**: Express.js REST API (Node.js + MongoDB + Mongoose)
- **Frontend**: Next.js 16 dashboard with RTK Query for data fetching
- **Database**: MongoDB with ~15,000 cars, 50 dealers, 17,977 service records, and 22,707 accident records

## Development Commands

### Backend (Express.js API)
```bash
cd backend
npm install                  # Install dependencies
npm run dev                  # Development mode with nodemon (auto-restart)
npm start                    # Production mode
```

**Default port**: 5000 (configurable via `PORT` in `.env`)

### Frontend (Next.js)
```bash
cd frontend
npm install                  # Install dependencies
npm run dev                  # Development server (port 3000)
npm run build                # Production build
npm start                    # Start production server
npm run lint                 # Run ESLint
```

**Note**: Frontend runs on port 3000 by default and connects to backend at `http://localhost:5001/api` (configured in `.env.local`)

### MongoDB
```bash
mongod                       # Start MongoDB (if not running as service)
mongosh                      # MongoDB shell
use carsales                 # Switch to carsales database
```

## Architecture

### Backend Structure (`/backend`)

**Entry Point**: `server.js` - Express application with CORS, JSON parsing, Morgan logging

**Key Directories**:
- `config/db.js` - MongoDB connection with Mongoose (async connection, error handling, event listeners)
- `models/` - Mongoose schemas with indexes
  - `Car.js` - Main car model with embedded service/accident summaries (hybrid pattern)
  - `Dealer.js` - Dealer model with GeoJSON location (2dsphere index for geospatial queries)
  - `Service.js` - Service records referenced by car_id
  - `Accident.js` - Accident records referenced by car_id
- `routes/` - Express router definitions
  - `cars.js` - Car endpoints (list, search, details, history)
  - `dealers.js` - Dealer endpoints (list, inventory, nearby with geospatial)
  - `analytics.js` - Analytics endpoints (overview, manufacturer stats, fuel distribution, trends)
- `controllers/` - Request handlers with business logic
  - `carController.js` - 4 methods (getAllCars, getCarById, searchCars, getCarHistory)
  - `dealerController.js` - 4 methods (getAllDealers, getDealerById, getDealerInventory, getNearbyDealers)
  - `analyticsController.js` - 8 methods using MongoDB aggregation pipelines

**API Endpoints**: All routes are prefixed with `/api`
- `/api/cars` - Car listings, search, and details
- `/api/dealers` - Dealer listings and geospatial queries
- `/api/analytics` - Dashboard statistics and trends

### Frontend Structure (`/frontend`)

**Framework**: Next.js 16 (App Router) with React 19, TypeScript, Tailwind CSS

**State Management**: Redux Toolkit with RTK Query
- `store/store.ts` - Redux store configuration
- `store/services/api.ts` - Base API slice with fetchBaseQuery
- `store/services/carsApi.ts` - Cars API endpoints (extends apiSlice)
- `store/services/dealersApi.ts` - Dealers API endpoints
- `store/services/analyticsApi.ts` - Analytics API endpoints

**Key Directories**:
- `app/` - Next.js App Router pages
  - `page.tsx` - Dashboard homepage with charts and filters
  - `cars/page.tsx` - Cars listing page
  - `dealers/page.tsx` - Dealers listing page
  - `layout.tsx` - Root layout with ReduxProvider
- `components/` - React components
  - `layout/` - Header, Sidebar
  - `dashboard/` - Stats cards, data table, filter panel, query panel, charts
  - `ui/` - shadcn/ui components (Radix UI primitives)
  - `providers/ReduxProvider.tsx` - Client-side Redux wrapper
- `lib/` - Utilities and context
  - `filter-context.tsx` - Filter state management
  - `utils.ts` - Utility functions (cn for classNames)
  - `transformers.ts` - Data transformation utilities

**UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- Charts: Recharts library
- Icons: Lucide React

### Database Schema Design (MongoDB Hybrid Pattern)

**Philosophy**: Embed frequently accessed data, reference shared/large data

**Collections**:

1. **cars** (15,000 documents)
   - Embedded: `features` array, `service_summary` object, `accident_summary` object
   - Referenced: `dealer_id` (links to dealers collection)
   - Indexes: car_id (unique), manufacturer, price, fuel_type, year, dealer_id, compound (manufacturer+model)

2. **dealers** (50 documents)
   - GeoJSON `location` field for geospatial queries (type: "Point", coordinates: [lng, lat])
   - Index: 2dsphere on location for $near queries
   - Embedded: `contact` object, `statistics` object

3. **services** (17,977 documents)
   - References: `car_id`
   - Compound index: (car_id, date) for history queries

4. **accidents** (22,707 documents)
   - References: `car_id`
   - Compound index: (car_id, date) for history queries

**Why Hybrid?**
- Embedded summaries in cars enable fast queries without JOINs (e.g., "cars with >3 services")
- Separate service/accident collections enable analytics aggregations
- Dealer references avoid duplication (each dealer has ~300 cars)

## Environment Configuration

### Backend `.env`
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/carsales
CLIENT_URL=http://localhost:3000
```

**Note**: The backend actually runs on port 5001 in development (check server.js)

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## Common Development Workflows

### Running the Full Stack
1. Start MongoDB: `mongod` (or ensure service is running)
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Access dashboard: `http://localhost:3000`

### Adding New API Endpoints
1. Create controller method in `backend/controllers/`
2. Add route in `backend/routes/`
3. Register route in `server.js` (if new router)
4. Create RTK Query endpoint in `frontend/store/services/` API slice
5. Use hook in component: `useGetXQuery()`

### Working with MongoDB Aggregations
Controllers in `analyticsController.js` use MongoDB aggregation pipelines extensively. Common patterns:
- `$match` for filtering
- `$group` for aggregation
- `$lookup` for joining collections (e.g., cars to dealers)
- `$project` for shaping output

### Geospatial Queries
Dealer location queries use MongoDB's geospatial operators:
```javascript
location: {
  $near: {
    $geometry: { type: "Point", coordinates: [lng, lat] },
    $maxDistance: 10000  // meters
  }
}
```

## Important Notes

### Port Configuration
- Backend is configured for port 5000 in `.env` but may run on 5001
- Frontend expects backend at `http://localhost:5001/api`
- Ensure CORS allows the frontend origin in `server.js`

### MongoDB Connection
- Database name: `carsales`
- Connection managed by `config/db.js` with auto-reconnect
- Models use Mongoose ODM with strict schemas and validation

### Data Consistency
When updating services/accidents in separate collections, remember to update embedded summaries in the cars collection to maintain data consistency.

### Frontend Data Fetching
All API calls use RTK Query hooks which provide:
- Automatic caching
- Loading/error states
- Automatic refetching
- Optimistic updates support

### Testing API Endpoints
Use curl or Postman:
```bash
# Get overview stats
curl http://localhost:5001/api/analytics/overview

# Search cars
curl -X POST http://localhost:5001/api/cars/search \
  -H "Content-Type: application/json" \
  -d '{"manufacturers":["Toyota"]}'

# Find nearby dealers
curl "http://localhost:5001/api/dealers/nearby?lat=53.713263&lng=0.738007&maxDistance=10000"
```
