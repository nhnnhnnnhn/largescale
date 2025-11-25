// Backend API Response Types (snake_case)
export interface BackendCar {
    _id?: string
    car_id: string
    manufacturer: string
    model: string
    specifications: {
        engine_size?: number
        fuel_type: string
        year_of_manufacturing: number
        mileage: number
    }
    price: number
    features: string[]
    dealer_id: string
    service_summary: {
        total_services: number
        last_service_date?: string
        total_cost: number
        last_service_type?: string
    }
    accident_summary: {
        total_accidents: number
        last_accident_date?: string
        total_repair_cost: number
        highest_severity?: string
    }
    created_at?: string
    updated_at?: string
}

export interface BackendService {
    _id?: string
    service_id: string
    car_id: string
    date: string
    type: string
    cost: number
    description?: string
}

export interface BackendAccident {
    _id?: string
    accident_id: string
    car_id: string
    date: string
    description: string
    cost_of_repair: number
    severity: "Minor" | "Moderate" | "Major"
}

export interface BackendDealer {
    _id?: string
    dealer_id: string
    name: string
    city: string
    location?: {
        type: "Point"
        coordinates: [number, number] // [longitude, latitude]
    }
    contact?: {
        phone?: string
        email?: string
    }
    statistics: {
        total_cars: number
        average_price: number
    }
    created_at?: string
}

// API Response Wrappers
export interface ApiResponse<T> {
    success: boolean
    data: T
    metadata?: {
        page?: number
        limit?: number
        total?: number
        pages?: number
        filters?: any
    }
    error?: {
        message: string
        code: string
    }
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
    metadata: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

// Car History Response
export interface BackendCarHistory {
    car: BackendCar
    service_history: BackendService[]
    accident_history: BackendAccident[]
    summary: {
        total_services: number
        total_service_cost: number
        total_accidents: number
        total_repair_cost: number
    }
}

// Analytics Response Types
export interface AnalyticsOverview {
    total_cars: number
    average_price: number
    min_price: number
    max_price: number
    total_dealers: number
    total_services: number
    total_accidents: number
}

export interface ManufacturerStats {
    manufacturer: string
    count: number
    avgPrice: number
    minPrice: number
    maxPrice: number
}

export interface FuelTypeStats {
    fuel_type: string
    count: number
    avgPrice: number
    percentage: number
}

export interface ServiceTrend {
    month: string
    count: number
    totalCost: number
    avgCost: number
}

export interface AccidentSeverityStats {
    manufacturer: string
    severity: string
    count: number
    avgRepairCost: number
}

export interface MileagePriceData {
    car_id: string
    manufacturer: string
    model: string
    mileage: number
    price: number
    year: number
    fuel_type: string
}

export interface PriceDistribution {
    _id: number
    count: number
    avgPrice: number
}

export interface TopDealer {
    dealer_id: string
    dealer_name: string
    dealer_city: string
    total_cars: number
    total_sales: number
    avg_price: number
}

// Search Request Body
export interface SearchCarsRequest {
    manufacturers?: string[]
    priceMin?: number
    priceMax?: number
    yearMin?: number
    yearMax?: number
    fuelTypes?: string[]
    features?: string[]
    dealerCity?: string
    minServices?: number
    maxAccidents?: number
}
