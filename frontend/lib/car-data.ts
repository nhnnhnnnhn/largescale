export interface CarRecord {
  CarID: string
  Manufacturer: string
  Model: string
  EngineSize: number
  Features: string[]
  FuelType: string
  YearOfManufacturing: number
  Mileage: number
  Price: number
  DealerName: string
  DealerCity: string
  Latitude: number
  Longitude: number
  ServiceHistory: ServiceRecord[]
  Accidents: AccidentRecord[]
}

export interface ServiceRecord {
  ServiceID: string
  DateOfService: string
  ServiceType: string
  CostOfService: number
}

export interface AccidentRecord {
  AccidentID: string
  DateOfAccident: string
  Description: string
  CostOfRepair: number
  Severity: "Minor" | "Moderate" | "Major"
}

// Sample data matching the UK Car Sales Dataset structure
export const carSalesData: CarRecord[] = [
  {
    CarID: "CAR001",
    Manufacturer: "BMW",
    Model: "3 Series",
    EngineSize: 2.0,
    Features: ["Leather Seats", "Navigation", "Sunroof"],
    FuelType: "Petrol",
    YearOfManufacturing: 2021,
    Mileage: 25000,
    Price: 32500,
    DealerName: "Premier Motors",
    DealerCity: "London",
    Latitude: 51.5074,
    Longitude: -0.1278,
    ServiceHistory: [
      { ServiceID: "SRV001", DateOfService: "2022-03-15", ServiceType: "Oil Change", CostOfService: 150 },
      { ServiceID: "SRV002", DateOfService: "2023-01-20", ServiceType: "Brake Service", CostOfService: 450 },
    ],
    Accidents: [],
  },
  {
    CarID: "CAR002",
    Manufacturer: "Audi",
    Model: "A4",
    EngineSize: 2.0,
    Features: ["Heated Seats", "Parking Sensors", "Bluetooth"],
    FuelType: "Diesel",
    YearOfManufacturing: 2020,
    Mileage: 45000,
    Price: 28000,
    DealerName: "City Auto",
    DealerCity: "Manchester",
    Latitude: 53.4808,
    Longitude: -2.2426,
    ServiceHistory: [
      { ServiceID: "SRV003", DateOfService: "2021-06-10", ServiceType: "Full Service", CostOfService: 350 },
    ],
    Accidents: [
      {
        AccidentID: "ACC001",
        DateOfAccident: "2022-08-05",
        Description: "Minor rear collision",
        CostOfRepair: 1200,
        Severity: "Minor",
      },
    ],
  },
  {
    CarID: "CAR003",
    Manufacturer: "Mercedes",
    Model: "C-Class",
    EngineSize: 2.5,
    Features: ["Premium Sound", "Adaptive Cruise", "LED Headlights"],
    FuelType: "Hybrid",
    YearOfManufacturing: 2022,
    Mileage: 15000,
    Price: 42000,
    DealerName: "Prestige Cars",
    DealerCity: "Birmingham",
    Latitude: 52.4862,
    Longitude: -1.8904,
    ServiceHistory: [],
    Accidents: [],
  },
  {
    CarID: "CAR004",
    Manufacturer: "Toyota",
    Model: "Corolla",
    EngineSize: 1.8,
    Features: ["Apple CarPlay", "Lane Assist", "Reverse Camera"],
    FuelType: "Hybrid",
    YearOfManufacturing: 2021,
    Mileage: 30000,
    Price: 22000,
    DealerName: "AutoWorld",
    DealerCity: "Leeds",
    Latitude: 53.8008,
    Longitude: -1.5491,
    ServiceHistory: [
      { ServiceID: "SRV004", DateOfService: "2022-09-01", ServiceType: "Tire Replacement", CostOfService: 600 },
    ],
    Accidents: [],
  },
  {
    CarID: "CAR005",
    Manufacturer: "Ford",
    Model: "Focus",
    EngineSize: 1.5,
    Features: ["Bluetooth", "Air Conditioning", "Electric Windows"],
    FuelType: "Petrol",
    YearOfManufacturing: 2019,
    Mileage: 55000,
    Price: 15500,
    DealerName: "Value Motors",
    DealerCity: "Glasgow",
    Latitude: 55.8642,
    Longitude: -4.2518,
    ServiceHistory: [
      { ServiceID: "SRV005", DateOfService: "2020-04-20", ServiceType: "Oil Change", CostOfService: 120 },
      { ServiceID: "SRV006", DateOfService: "2021-07-15", ServiceType: "Battery Replacement", CostOfService: 180 },
    ],
    Accidents: [
      {
        AccidentID: "ACC002",
        DateOfAccident: "2021-02-10",
        Description: "Front bumper damage",
        CostOfRepair: 800,
        Severity: "Minor",
      },
    ],
  },
  {
    CarID: "CAR006",
    Manufacturer: "Volkswagen",
    Model: "Golf",
    EngineSize: 1.6,
    Features: ["Touchscreen", "Parking Sensors", "Start/Stop"],
    FuelType: "Diesel",
    YearOfManufacturing: 2020,
    Mileage: 42000,
    Price: 19500,
    DealerName: "Euro Cars",
    DealerCity: "Bristol",
    Latitude: 51.4545,
    Longitude: -2.5879,
    ServiceHistory: [
      { ServiceID: "SRV007", DateOfService: "2021-11-30", ServiceType: "Full Service", CostOfService: 280 },
    ],
    Accidents: [],
  },
  {
    CarID: "CAR007",
    Manufacturer: "BMW",
    Model: "5 Series",
    EngineSize: 3.0,
    Features: ["M Sport Package", "Harman Kardon", "Heads Up Display"],
    FuelType: "Petrol",
    YearOfManufacturing: 2022,
    Mileage: 12000,
    Price: 48000,
    DealerName: "Premier Motors",
    DealerCity: "London",
    Latitude: 51.5074,
    Longitude: -0.1278,
    ServiceHistory: [],
    Accidents: [],
  },
  {
    CarID: "CAR008",
    Manufacturer: "Tesla",
    Model: "Model 3",
    EngineSize: 0,
    Features: ["Autopilot", "Premium Interior", "Glass Roof"],
    FuelType: "Electric",
    YearOfManufacturing: 2023,
    Mileage: 8000,
    Price: 45000,
    DealerName: "EV Centre",
    DealerCity: "Edinburgh",
    Latitude: 55.9533,
    Longitude: -3.1883,
    ServiceHistory: [],
    Accidents: [],
  },
  {
    CarID: "CAR009",
    Manufacturer: "Honda",
    Model: "Civic",
    EngineSize: 1.5,
    Features: ["Honda Sensing", "Wireless Charging", "Digital Cluster"],
    FuelType: "Petrol",
    YearOfManufacturing: 2021,
    Mileage: 28000,
    Price: 24500,
    DealerName: "AutoWorld",
    DealerCity: "Liverpool",
    Latitude: 53.4084,
    Longitude: -2.9916,
    ServiceHistory: [
      { ServiceID: "SRV008", DateOfService: "2022-12-05", ServiceType: "Brake Pads", CostOfService: 220 },
    ],
    Accidents: [],
  },
  {
    CarID: "CAR010",
    Manufacturer: "Audi",
    Model: "Q5",
    EngineSize: 2.0,
    Features: ["Quattro AWD", "Virtual Cockpit", "Matrix LED"],
    FuelType: "Diesel",
    YearOfManufacturing: 2021,
    Mileage: 35000,
    Price: 38000,
    DealerName: "City Auto",
    DealerCity: "Manchester",
    Latitude: 53.4808,
    Longitude: -2.2426,
    ServiceHistory: [
      { ServiceID: "SRV009", DateOfService: "2023-02-18", ServiceType: "Full Service", CostOfService: 420 },
    ],
    Accidents: [],
  },
  {
    CarID: "CAR011",
    Manufacturer: "Mercedes",
    Model: "E-Class",
    EngineSize: 2.9,
    Features: ["AMG Line", "Burmester Sound", "Air Suspension"],
    FuelType: "Hybrid",
    YearOfManufacturing: 2022,
    Mileage: 18000,
    Price: 52000,
    DealerName: "Prestige Cars",
    DealerCity: "London",
    Latitude: 51.5074,
    Longitude: -0.1278,
    ServiceHistory: [],
    Accidents: [],
  },
  {
    CarID: "CAR012",
    Manufacturer: "Nissan",
    Model: "Leaf",
    EngineSize: 0,
    Features: ["ProPilot", "e-Pedal", "Quick Charge"],
    FuelType: "Electric",
    YearOfManufacturing: 2022,
    Mileage: 20000,
    Price: 28500,
    DealerName: "EV Centre",
    DealerCity: "Cardiff",
    Latitude: 51.4816,
    Longitude: -3.1791,
    ServiceHistory: [],
    Accidents: [],
  },
  {
    CarID: "CAR013",
    Manufacturer: "Ford",
    Model: "Mustang",
    EngineSize: 5.0,
    Features: ["V8 Engine", "Launch Control", "Track Apps"],
    FuelType: "Petrol",
    YearOfManufacturing: 2020,
    Mileage: 22000,
    Price: 42000,
    DealerName: "Premier Motors",
    DealerCity: "London",
    Latitude: 51.5074,
    Longitude: -0.1278,
    ServiceHistory: [
      { ServiceID: "SRV010", DateOfService: "2021-05-10", ServiceType: "Performance Check", CostOfService: 350 },
    ],
    Accidents: [
      {
        AccidentID: "ACC003",
        DateOfAccident: "2022-04-20",
        Description: "Side panel scratch",
        CostOfRepair: 600,
        Severity: "Minor",
      },
    ],
  },
  {
    CarID: "CAR014",
    Manufacturer: "Toyota",
    Model: "RAV4",
    EngineSize: 2.5,
    Features: ["All Wheel Drive", "JBL Audio", "Panoramic Roof"],
    FuelType: "Hybrid",
    YearOfManufacturing: 2023,
    Mileage: 5000,
    Price: 38500,
    DealerName: "AutoWorld",
    DealerCity: "Newcastle",
    Latitude: 54.9783,
    Longitude: -1.6178,
    ServiceHistory: [],
    Accidents: [],
  },
  {
    CarID: "CAR015",
    Manufacturer: "Volkswagen",
    Model: "ID.4",
    EngineSize: 0,
    Features: ["ID.Light", "Augmented Reality HUD", "Travel Assist"],
    FuelType: "Electric",
    YearOfManufacturing: 2023,
    Mileage: 3000,
    Price: 44000,
    DealerName: "Euro Cars",
    DealerCity: "Southampton",
    Latitude: 50.9097,
    Longitude: -1.4044,
    ServiceHistory: [],
    Accidents: [],
  },
  {
    CarID: "CAR016",
    Manufacturer: "BMW",
    Model: "X3",
    EngineSize: 2.0,
    Features: ["xDrive", "Parking Assistant", "Gesture Control"],
    FuelType: "Diesel",
    YearOfManufacturing: 2021,
    Mileage: 32000,
    Price: 36000,
    DealerName: "Premier Motors",
    DealerCity: "Birmingham",
    Latitude: 52.4862,
    Longitude: -1.8904,
    ServiceHistory: [
      { ServiceID: "SRV011", DateOfService: "2022-08-22", ServiceType: "Full Service", CostOfService: 380 },
    ],
    Accidents: [],
  },
  {
    CarID: "CAR017",
    Manufacturer: "Audi",
    Model: "e-tron",
    EngineSize: 0,
    Features: ["Quattro Electric", "Virtual Mirrors", "Matrix LED"],
    FuelType: "Electric",
    YearOfManufacturing: 2022,
    Mileage: 15000,
    Price: 55000,
    DealerName: "EV Centre",
    DealerCity: "Manchester",
    Latitude: 53.4808,
    Longitude: -2.2426,
    ServiceHistory: [],
    Accidents: [],
  },
  {
    CarID: "CAR018",
    Manufacturer: "Honda",
    Model: "CR-V",
    EngineSize: 2.0,
    Features: ["VTEC Engine", "Real Time AWD", "Walk Away Lock"],
    FuelType: "Hybrid",
    YearOfManufacturing: 2022,
    Mileage: 22000,
    Price: 34000,
    DealerName: "AutoWorld",
    DealerCity: "Sheffield",
    Latitude: 53.3811,
    Longitude: -1.4701,
    ServiceHistory: [
      { ServiceID: "SRV012", DateOfService: "2023-04-10", ServiceType: "Oil Change", CostOfService: 140 },
    ],
    Accidents: [],
  },
  {
    CarID: "CAR019",
    Manufacturer: "Mercedes",
    Model: "GLC",
    EngineSize: 2.0,
    Features: ["4MATIC", "MBUX", "Digital Light"],
    FuelType: "Petrol",
    YearOfManufacturing: 2023,
    Mileage: 8000,
    Price: 48000,
    DealerName: "Prestige Cars",
    DealerCity: "London",
    Latitude: 51.5074,
    Longitude: -0.1278,
    ServiceHistory: [],
    Accidents: [],
  },
  {
    CarID: "CAR020",
    Manufacturer: "Nissan",
    Model: "Qashqai",
    EngineSize: 1.3,
    Features: ["ProPilot", "Around View Monitor", "Bose Audio"],
    FuelType: "Petrol",
    YearOfManufacturing: 2022,
    Mileage: 18000,
    Price: 28000,
    DealerName: "Value Motors",
    DealerCity: "Nottingham",
    Latitude: 52.9548,
    Longitude: -1.1581,
    ServiceHistory: [
      { ServiceID: "SRV013", DateOfService: "2023-06-15", ServiceType: "Tire Rotation", CostOfService: 80 },
    ],
    Accidents: [],
  },
]

// Helper functions for data aggregation
export function getManufacturers(): string[] {
  return [...new Set(carSalesData.map((car) => car.Manufacturer))].sort()
}

export function getFuelTypes(): string[] {
  return [...new Set(carSalesData.map((car) => car.FuelType))].sort()
}

export function getCities(): string[] {
  return [...new Set(carSalesData.map((car) => car.DealerCity))].sort()
}

export function getYears(): number[] {
  return [...new Set(carSalesData.map((car) => car.YearOfManufacturing))].sort((a, b) => b - a)
}

export function getPriceRange(): { min: number; max: number } {
  const prices = carSalesData.map((car) => car.Price)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export function getMileageRange(): { min: number; max: number } {
  const mileages = carSalesData.map((car) => car.Mileage)
  return { min: Math.min(...mileages), max: Math.max(...mileages) }
}
