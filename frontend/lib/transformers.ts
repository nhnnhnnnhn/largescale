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
    // Create placeholder service records based on summary count
    // This allows the table to show counts even without full history
    const serviceHistory: ServiceRecord[] = Array.from(
        { length: backendCar.service_summary.total_services },
        (_, i) => ({
            ServiceID: `placeholder-${i}`,
            DateOfService: backendCar.service_summary.last_service_date || "",
            ServiceType: backendCar.service_summary.last_service_type || "Unknown",
            CostOfService: 0,
        })
    )

    // Create placeholder accident records based on summary count
    const accidents: AccidentRecord[] = Array.from(
        { length: backendCar.accident_summary.total_accidents },
        (_, i) => ({
            AccidentID: `placeholder-${i}`,
            DateOfAccident: backendCar.accident_summary.last_accident_date || "",
            Description: "",
            CostOfRepair: 0,
            Severity: (backendCar.accident_summary.highest_severity as any) || "Minor",
        })
    )

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
        ServiceHistory: serviceHistory,
        Accidents: accidents,
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
