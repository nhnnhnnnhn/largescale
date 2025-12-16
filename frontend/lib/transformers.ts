import type {
    BackendCar,
    BackendService,
    BackendAccident,
    BackendDealer,
    BackendCarHistory,
} from "@/types/api"
import type { CarRecord, ServiceRecord, AccidentRecord } from "./car-data"

// Transform backend car to frontend CarRecord
export function transformCar(
    backendCar: BackendCar,
    dealer?: BackendDealer
): CarRecord {
    // Parse features string to array
    const featuresArray = backendCar.features
        ? backendCar.features.split(',').map(f => f.trim())
        : []

    return {
        CarID: backendCar.car_id,
        Manufacturer: backendCar.manufacturer,
        Model: backendCar.model,
        EngineSize: backendCar.engine_size || 0,
        Features: featuresArray,
        FuelType: backendCar.fuel_type,
        YearOfManufacturing: backendCar.year_of_manufacturing,
        Mileage: backendCar.mileage,
        Price: backendCar.price,
        DealerName: dealer?.dealer_name || "",
        DealerCity: dealer?.dealer_city || "",
        Latitude: dealer?.latitude || 0,
        Longitude: dealer?.longitude || 0,
        ServiceHistory: [],
        Accidents: [],
        // Use counts from API if available
        AccidentCount: backendCar.accident_count,
        ServiceCount: backendCar.service_count,
    }
}

// Transform backend service to frontend ServiceRecord
export function transformService(
    backendService: BackendService
): ServiceRecord {
    return {
        ServiceID: backendService.service_id,
        DateOfService: backendService.date_of_service,
        ServiceType: backendService.service_type,
        CostOfService: backendService.cost_of_service,
    }
}

// Transform backend accident to frontend AccidentRecord
export function transformAccident(
    backendAccident: BackendAccident
): AccidentRecord {
    return {
        AccidentID: backendAccident.accident_id,
        DateOfAccident: backendAccident.date_of_accident,
        Description: backendAccident.description,
        CostOfRepair: backendAccident.cost_of_repair,
        Severity: backendAccident.severity,
    }
}

// Transform complete car history
export function transformCarHistory(
    history: BackendCarHistory,
    dealer?: BackendDealer
): CarRecord {
    const car = transformCar(history.car, dealer)
    car.ServiceHistory = history.service_history.map(transformService)
    car.Accidents = history.accident_history.map(transformAccident)
    return car
}

// Transform array of backend cars (with dealers lookup)
export function transformCars(
    backendCars: BackendCar[],
    dealers: Map<string, BackendDealer>
): CarRecord[] {
    return backendCars.map((car) => {
        const dealer = dealers.get(car.dealer_id)
        return transformCar(car, dealer)
    })
}
