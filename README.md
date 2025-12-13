# 🚗 Car Sales Dashboard

A full-stack web application for analyzing and visualizing car sales data. Built with **Express.js**, **MongoDB**, and **Next.js**.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-success) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-6+-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-16-black)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Data Schema](#data-schema)
- [License](#license)

## Overview

Car Sales Dashboard is an analytics platform designed to provide insights into car sales data. It features interactive charts, geospatial dealer queries, and comprehensive vehicle history tracking.

**Dataset includes:**
- 🚘 ~15,000 cars
- 🏪 50 dealers
- 🔧 17,977 service records
- ⚠️ 22,707 accident records

## ✨ Features

- **Dashboard Analytics**: Real-time statistics with interactive charts
- **Car Listings**: Search, filter, and browse cars by manufacturer, fuel type, price range
- **Dealer Management**: View dealer information with geospatial nearby search
- **Vehicle History**: Track complete service and accident history for each car
- **Advanced Filtering**: Multi-criteria search with instant results
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Express.js | REST API framework |
| MongoDB | NoSQL database |
| Mongoose | ODM for MongoDB |
| Morgan | HTTP request logger |
| CORS | Cross-origin resource sharing |

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework (App Router) |
| React 19 | UI library |
| TypeScript | Type safety |
| Redux Toolkit | State management |
| RTK Query | Data fetching & caching |
| Tailwind CSS | Utility-first styling |
| Recharts | Chart library |
| shadcn/ui | UI component library |
| Lucide React | Icon library |

## 📁 Project Structure

```
largescale/
├── backend/                 # Express.js API
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── server.js           # Entry point
│
├── frontend/               # Next.js application
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── layout/         # Header, Sidebar
│   │   └── ui/             # shadcn/ui components
│   ├── lib/                # Utilities and helpers
│   ├── store/              # Redux store and RTK Query
│   │   └── services/       # API slices
│   └── types/              # TypeScript definitions
│
└── cleaned_data/           # Processed data files
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **MongoDB** 6.0 or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd largescale
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**

   Backend (`backend/.env`):
   ```env
   NODE_ENV=development
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/carsales
   CLIENT_URL=http://localhost:3000
   ```

   Frontend (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   ```

### Running the Application

1. **Start MongoDB**
   ```bash
   mongod
   # Or if running as a service, ensure it's active
   ```

2. **Start the backend** (in one terminal)
   ```bash
   cd backend
   npm run dev
   ```

3. **Start the frontend** (in another terminal)
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the dashboard**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 API Documentation

### Base URL
```
http://localhost:5001/api
```

### Endpoints

#### Cars
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cars` | Get all cars with pagination |
| GET | `/cars/:id` | Get car by ID |
| POST | `/cars/search` | Search cars with filters |
| GET | `/cars/:id/history` | Get car's service & accident history |

#### Dealers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dealers` | Get all dealers |
| GET | `/dealers/:id` | Get dealer by ID |
| GET | `/dealers/:id/inventory` | Get dealer's car inventory |
| GET | `/dealers/nearby` | Find nearby dealers (geospatial) |

#### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/overview` | Get dashboard overview stats |
| GET | `/analytics/manufacturers` | Get stats by manufacturer |
| GET | `/analytics/fuel-distribution` | Get fuel type distribution |
| GET | `/analytics/trends` | Get sales/service trends |

### Example Requests

```bash
# Get overview statistics
curl http://localhost:5001/api/analytics/overview

# Search for Toyota cars
curl -X POST http://localhost:5001/api/cars/search \
  -H "Content-Type: application/json" \
  -d '{"manufacturers":["Toyota"]}'

# Find nearby dealers
curl "http://localhost:5001/api/dealers/nearby?lat=53.713&lng=0.738&maxDistance=10000"
```

## 🗄️ Data Schema

The project uses a **hybrid MongoDB pattern** for optimal performance:

### Collections

| Collection | Documents | Description |
|------------|-----------|-------------|
| `cars` | ~15,000 | Vehicle data with embedded summaries |
| `dealers` | 50 | Dealer info with GeoJSON location |
| `services` | 17,977 | Service records (referenced by car_id) |
| `accidents` | 22,707 | Accident records (referenced by car_id) |

### Key Design Decisions

- **Embedded summaries** in cars for fast dashboard queries
- **GeoJSON locations** enable efficient geospatial dealer queries
- **Compound indexes** on (car_id, date) for history lookups
- **Referenced data** for analytics aggregations

## 📝 Scripts

### Backend
```bash
npm run dev    # Development with nodemon
npm start      # Production mode
```

### Frontend
```bash
npm run dev    # Development server
npm run build  # Production build
npm start      # Start production server
npm run lint   # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for analytics enthusiasts
</p>
