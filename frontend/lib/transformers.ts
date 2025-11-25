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
    return {
        CarID: backendCar.car_id,
        Manufacturer: backendCar.manufacturer,
        Model: backendCar.model,
        EngineSize: backendCar.specifications.engine_size || 0,
        Features: backendCar.features,
        FuelType: backendCar.specifications.fuel_type,
        YearOfManufacturing: backendCar.specifications.year_of_manufacturing,
        Mileage: backendCar.specifications.mileage,
        Price: backendCar.price,
        DealerName: dealer?.name || "",
        DealerCity: dealer?.city || "",
        Latitude: dealer?.location?.coordinates[1] || 0,
        Longitude: dealer?.location?.coordinates[0] || 0,
        ServiceHistory: [],
        Accidents: [],
    }
}

// Transform backend service to frontend ServiceRecord
export function transformService(
    backendService: BackendService
): ServiceRecord {
    return {
        ServiceID: backendService.service_id,
        DateOfService: backendService.date,
        ServiceType: backendService.type,
        CostOfService: backendService.cost,
    }
}

// Transform backend accident to frontend AccidentRecord
export function transformAccident(
    backendAccident: BackendAccident
): AccidentRecord {
    return {
        AccidentID: backendAccident.accident_id,
        DateOfAccident: backendAccident.date,
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
