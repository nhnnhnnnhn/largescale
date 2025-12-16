// Backend API Response Types (snake_case) - Flat schema matching CSV
export interface BackendCar {
    _id?: string
    car_id: string
    manufacturer: string
    model: string
    engine_size?: number
    fuel_type: string
    year_of_manufacturing: number
    mileage: number
    price: number
    features: string  // comma-separated string
    dealer_id: string
    // Added by search endpoint - counts from related collections
    accident_count?: number
    service_count?: number
}

export interface BackendService {
    _id?: string
    service_id: string
    car_id: string
    date_of_service: string
    service_type: string
    cost_of_service: number
}

export interface BackendAccident {
    _id?: string
    accident_id: string
    car_id: string
    date_of_accident: string
    description: string
    cost_of_repair: number
    severity: "Minor" | "Moderate" | "Major" | "Severe"
}

export interface BackendDealer {
    _id?: string
    dealer_id: string
    dealer_name: string
    dealer_city: string
    latitude: number
    longitude: number
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

export interface AccidentTrend {
    month: string
    count: number
    totalCost: number
    avgCost: number
}

// Search Request Body
export interface SearchCarsRequest {
    carId?: string
    manufacturers?: string[]
    priceMin?: number
    priceMax?: number
    yearMin?: number
    yearMax?: number
    fuelTypes?: string[]
    features?: string[]
    dealerCity?: string
    dealerIds?: string[]
    sortField?: string
    sortOrder?: 'asc' | 'desc'
}
