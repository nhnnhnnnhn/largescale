"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { useSearchCarsMutation } from "@/store/services/carsApi"
import { useGetDealersQuery } from "@/store/services/dealersApi"
import { transformCars } from "@/lib/transformers"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    Search,
    Car,
    Fuel,
    Calendar,
    Gauge,
    PoundSterling,
    MapPin,
    Settings,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    X,
    Filter,
    ArrowUpDown,
    Wrench,
    Info,
} from "lucide-react"
import type { CarRecord } from "@/lib/car-data"

const ITEMS_PER_PAGE = 15

type SortField = "CarID" | "Manufacturer" | "Year" | "Price" | "Mileage" | "Accidents" | "Services"
type SortDirection = "asc" | "desc"

export default function CarsPage() {
    // Mutations and queries
    const [searchCars, { data: searchResponse, isLoading: carsLoading, error: carsError }] = useSearchCarsMutation()
    const { data: dealersData, isLoading: dealersLoading } = useGetDealersQuery()

    // Filter state
    const [selectedManufacturer, setSelectedManufacturer] = useState<string>("all")
    const [selectedFuelType, setSelectedFuelType] = useState<string>("all")
    const [selectedYear, setSelectedYear] = useState<string>("all")
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
    const [mileageRange, setMileageRange] = useState<[number, number]>([0, 200000])

    // Search & Pagination State
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    // Advanced Filter State
    const [accidentCountFilter, setAccidentCountFilter] = useState<string>("all")
    const [serviceCountFilter, setServiceCountFilter] = useState<string>("all")

    // Sorting State - Note: backend doesn't support sorting yet, so we'll disable it
    const [sortField, setSortField] = useState<SortField>("CarID")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    // Selected Car State
    const [selectedCar, setSelectedCar] = useState<CarRecord | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Service/Accident Tab Sorting
    const [serviceSortField, setServiceSortField] = useState<"date" | "cost">("date")
    const [serviceSortDirection, setServiceSortDirection] = useState<SortDirection>("desc")
    const [accidentSeverityFilter, setAccidentSeverityFilter] = useState<string>("all")

    // Fetch initial data and when filters change
    useEffect(() => {
        const filters: any = {}

        // Build filter object for backend
        if (selectedManufacturer !== "all") {
            filters.manufacturers = [selectedManufacturer]
        }

        if (selectedFuelType !== "all") {
            filters.fuelTypes = [selectedFuelType]
        }

        if (selectedYear !== "all") {
            const year = parseInt(selectedYear)
            filters.yearMin = year
            filters.yearMax = year
        }

        if (priceRange[0] > 0 || priceRange[1] < 100000) {
            filters.priceMin = priceRange[0]
            filters.priceMax = priceRange[1]
        }

        // Note: Mileage filter not supported by backend yet
        // Accident/Service count filters not directly supported

        // Call search API
        searchCars({
            filters,
            page: currentPage,
            limit: ITEMS_PER_PAGE,
        })
    }, [selectedManufacturer, selectedFuelType, selectedYear, priceRange, currentPage, searchCars])

    // Transform backend data
    const cars = useMemo(() => {
        if (!searchResponse?.data || !dealersData?.data) return []
        const dealersMap = new Map(dealersData.data.map((d) => [d.dealer_id, d]))
        return transformCars(searchResponse.data, dealersMap)
    }, [searchResponse, dealersData])

    // Get filter options from all available data (for dropdowns)
    // We'll use static lists since we can't fetch all 15k cars
    const filterOptions = useMemo(() => {
        return {
            manufacturers: ["Audi", "BMW", "Ford", "Honda", "Jaguar", "Land Rover", "Mercedes-Benz", "Nissan", "Porsche", "Toyota", "Volkswagen"],
            fuelTypes: ["Diesel", "Electric", "Hybrid", "Petrol"],
            years: Array.from({ length: 11 }, (_, i) => 2024 - i), // 2024 to 2014
            priceRange: { min: 0, max: 100000 },
            mileageRange: { min: 0, max: 200000 },
        }
    }, [])

    // Client-side filtering for search query and advanced filters (on current page results)
    const filteredCars = useMemo(() => {
        return cars.filter((car) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const matchesSearch =
                    car.CarID.toLowerCase().includes(query) ||
                    car.Manufacturer.toLowerCase().includes(query) ||
                    car.Model.toLowerCase().includes(query)
                if (!matchesSearch) return false
            }

            // Mileage filter (client-side since backend doesn't support)
            if (car.Mileage < mileageRange[0] || car.Mileage > mileageRange[1]) {
                return false
            }

            // Advanced filters (client-side)
            const accidentCount = car.Accidents.length
            const serviceCount = car.ServiceHistory.length

            let matchesAccidents = true
            if (accidentCountFilter === "0") matchesAccidents = accidentCount === 0
            else if (accidentCountFilter === "1") matchesAccidents = accidentCount === 1
            else if (accidentCountFilter === "2+") matchesAccidents = accidentCount >= 2

            let matchesServices = true
            if (serviceCountFilter === "0") matchesServices = serviceCount === 0
            else if (serviceCountFilter === "1-2") matchesServices = serviceCount >= 1 && serviceCount <= 2
            else if (serviceCountFilter === "3+") matchesServices = serviceCount >= 3

            return matchesAccidents && matchesServices
        })
    }, [cars, searchQuery, mileageRange, accidentCountFilter, serviceCountFilter])

    // Metadata from backend response
    const totalPages = searchResponse?.metadata?.pages || 1
    const totalCars = searchResponse?.metadata?.total || 0

    // Reset filters
    const handleResetFilters = () => {
        setSelectedManufacturer("all")
        setSelectedFuelType("all")
        setSelectedYear("all")
        setPriceRange([0, 100000])
        setMileageRange([0, 200000])
        setAccidentCountFilter("all")
        setServiceCountFilter("all")
        setSearchQuery("")
        setCurrentPage(1)
    }

    // Filter change handler with page reset
    const handleFilterChange = (key: string, value: string) => {
        if (key === "manufacturer") setSelectedManufacturer(value)
        else if (key === "fuelType") setSelectedFuelType(value)
        else if (key === "year") setSelectedYear(value)
        setCurrentPage(1)
    }

    // Sort Handler (disabled for now since backend doesn't support it)
    const handleSort = (field: SortField) => {
        // Disabled - would need backend support
        console.log("Sorting not supported with server-side pagination yet")
    }

    const handleCarSelect = (car: CarRecord) => {
        setSelectedCar(car)
        setIsDialogOpen(true)
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false)
    }

    // Sorted Services
    const sortedServices = useMemo(() => {
        if (!selectedCar) return []
        return [...selectedCar.ServiceHistory].sort((a, b) => {
            if (serviceSortField === "date") {
                return serviceSortDirection === "desc"
                    ? new Date(b.DateOfService).getTime() - new Date(a.DateOfService).getTime()
                    : new Date(a.DateOfService).getTime() - new Date(b.DateOfService).getTime()
            }
            return serviceSortDirection === "desc" ? b.CostOfService - a.CostOfService : a.CostOfService - b.CostOfService
        })
    }, [selectedCar, serviceSortField, serviceSortDirection])

    // Filtered Accidents
    const filteredAccidents = useMemo(() => {
        if (!selectedCar) return []
        if (accidentSeverityFilter === "all") return selectedCar.Accidents
        return selectedCar.Accidents.filter((a) => a.Severity === accidentSeverityFilter)
    }, [selectedCar, accidentSeverityFilter])

    // Calculate summaries for selected car
    const carSummary = useMemo(() => {
        if (!selectedCar) return null

        const services = selectedCar.ServiceHistory
        const accidents = selectedCar.Accidents

        const latestService =
            services.length > 0
                ? services.reduce((latest, s) => (new Date(s.DateOfService) > new Date(latest.DateOfService) ? s : latest))
                : null

        const latestAccident =
            accidents.length > 0
                ? accidents.reduce((latest, a) => (new Date(a.DateOfAccident) > new Date(latest.DateOfAccident) ? a : latest))
                : null

        const highestSeverity =
            accidents.length > 0
                ? accidents.reduce((highest, a) => {
                    const severityOrder = { Minor: 1, Moderate: 2, Major: 3 }
                    return severityOrder[a.Severity] > severityOrder[highest.Severity] ? a : highest
                }).Severity
                : null

        return {
            totalServices: services.length,
            totalServiceCost: services.reduce((sum, s) => sum + s.CostOfService, 0),
            latestServiceType: latestService?.ServiceType || "N/A",
            latestServiceDate: latestService?.DateOfService || "N/A",
            totalAccidents: accidents.length,
            totalRepairCost: accidents.reduce((sum, a) => sum + a.CostOfRepair, 0),
            latestAccidentDate: latestAccident?.DateOfAccident || "N/A",
            highestSeverity,
        }
    }, [selectedCar])

    const fuelTypeColors: Record<string, string> = {
        Petrol: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        Diesel: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        Hybrid: "bg-teal-500/20 text-teal-400 border-teal-500/30",
        Electric: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    }

    const severityColors: Record<string, string> = {
        Minor: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        Moderate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        Major: "bg-red-500/20 text-red-400 border-red-500/30",
    }

    const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
        <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
            onClick={() => handleSort(field)}
        >
            {children}
            <ArrowUpDown className={`ml-1 h-3 w-3 ${sortField === field ? "text-primary" : ""}`} />
        </Button>
    )

    // Show loading state
    if (carsLoading || dealersLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading vehicles...</p>
                </div>
            </div>
        )
    }

    // Show error state
    if (carsError) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Failed to load vehicles. Please try again.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Header
                title="Cars"
                subtitle="Browse and explore vehicle inventory"
                filters={{
                    manufacturers: filterOptions.manufacturers,
                    fuelTypes: filterOptions.fuelTypes,
                    years: filterOptions.years,
                }}
                selectedFilters={{
                    manufacturer: selectedManufacturer,
                    fuelType: selectedFuelType,
                    year: selectedYear,
                    city: "all", // Cars page doesn't filter by city
                }}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
            />

            <div className="p-6">
                <Card className="bg-card border-border">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Car className="h-4 w-4 text-primary" />
                                Vehicle Inventory
                                <Badge variant="secondary" className="ml-2">
                                    {totalCars} vehicles
                                </Badge>
                            </CardTitle>
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by Car ID or Manufacturer..."
                                    className="pl-9 h-9"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Advanced Filters */}
                        <div className="px-6 pb-4 space-y-4 border-b border-border">
                            {/* Price & Mileage Sliders */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Price Range</span>
                                        <span className="font-mono text-xs text-primary">
                                            £{priceRange[0].toLocaleString()} - £{priceRange[1].toLocaleString()}
                                        </span>
                                    </div>
                                    <Slider
                                        min={filterOptions.priceRange.min}
                                        max={filterOptions.priceRange.max}
                                        step={1000}
                                        value={priceRange}
                                        onValueChange={(value) => {
                                            setPriceRange(value as [number, number])
                                            setCurrentPage(1)
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Mileage Range</span>
                                        <span className="font-mono text-xs text-accent">
                                            {mileageRange[0].toLocaleString()} - {mileageRange[1].toLocaleString()} mi
                                        </span>
                                    </div>
                                    <Slider
                                        min={filterOptions.mileageRange.min}
                                        max={filterOptions.mileageRange.max}
                                        step={1000}
                                        value={mileageRange}
                                        onValueChange={(value) => {
                                            setMileageRange(value as [number, number])
                                            setCurrentPage(1)
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Advanced:</span>
                                </div>
                                <Select
                                    value={accidentCountFilter}
                                    onValueChange={(v) => {
                                        setAccidentCountFilter(v)
                                        setCurrentPage(1)
                                    }}
                                >
                                    <SelectTrigger className="w-[150px] h-8">
                                        <SelectValue placeholder="Accidents" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Accidents</SelectItem>
                                        <SelectItem value="0">No Accidents</SelectItem>
                                        <SelectItem value="1">1 Accident</SelectItem>
                                        <SelectItem value="2+">2+ Accidents</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={serviceCountFilter}
                                    onValueChange={(v) => {
                                        setServiceCountFilter(v)
                                        setCurrentPage(1)
                                    }}
                                >
                                    <SelectTrigger className="w-[150px] h-8">
                                        <SelectValue placeholder="Services" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Services</SelectItem>
                                        <SelectItem value="0">No Services</SelectItem>
                                        <SelectItem value="1-2">1-2 Services</SelectItem>
                                        <SelectItem value="3+">3+ Services</SelectItem>
                                    </SelectContent>
                                </Select>
                                {(accidentCountFilter !== "all" || serviceCountFilter !== "all") && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => {
                                            setAccidentCountFilter("all")
                                            setServiceCountFilter("all")
                                        }}
                                    >
                                        <X className="h-3 w-3 mr-1" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        <ScrollArea className="h-[calc(100vh-340px)]">
                            <Table>
                                <TableHeader className="sticky top-0 bg-card z-10">
                                    <TableRow className="border-border hover:bg-transparent">
                                        <TableHead>
                                            <SortButton field="CarID">Car ID</SortButton>
                                        </TableHead>
                                        <TableHead>
                                            <SortButton field="Manufacturer">Manufacturer</SortButton>
                                        </TableHead>
                                        <TableHead>Model</TableHead>
                                        <TableHead>
                                            <SortButton field="Year">Year</SortButton>
                                        </TableHead>
                                        <TableHead>
                                            <SortButton field="Price">Price</SortButton>
                                        </TableHead>
                                        <TableHead>Fuel</TableHead>
                                        <TableHead>
                                            <SortButton field="Accidents">Accidents</SortButton>
                                        </TableHead>
                                        <TableHead>
                                            <SortButton field="Services">Services</SortButton>
                                        </TableHead>
                                        <TableHead>Dealer</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCars.map((car) => (
                                        <TableRow
                                            key={car.CarID}
                                            className="border-border cursor-pointer transition-colors hover:bg-muted/50"
                                            onClick={() => handleCarSelect(car)}
                                        >
                                            <TableCell className="font-mono text-xs text-primary">{car.CarID}</TableCell>
                                            <TableCell className="font-medium">{car.Manufacturer}</TableCell>
                                            <TableCell>{car.Model}</TableCell>
                                            <TableCell>{car.YearOfManufacturing}</TableCell>
                                            <TableCell className="font-semibold text-accent">£{car.Price.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={fuelTypeColors[car.FuelType]}>
                                                    {car.FuelType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={car.Accidents.length > 0 ? "destructive" : "secondary"} className="text-xs">
                                                    {car.Accidents.length}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">
                                                    {car.ServiceHistory.length}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{car.DealerName}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>

                        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {filteredCars.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} -{" "}
                                {Math.min(currentPage * ITEMS_PER_PAGE, totalCars)} of {totalCars} vehicles
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm px-2">
                                    Page {currentPage} of {totalPages || 1}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
                        {selectedCar && (
                            <>
                                <DialogHeader className="p-6 pb-0">
                                    <DialogTitle className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Car className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <span className="text-xl">
                                                {selectedCar.Manufacturer} {selectedCar.Model}
                                            </span>
                                            <p className="text-sm font-normal text-muted-foreground font-mono mt-0.5">{selectedCar.CarID}</p>
                                        </div>
                                    </DialogTitle>
                                </DialogHeader>

                                <Tabs defaultValue="info" className="w-full">
                                    <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-6">
                                        <TabsTrigger value="info" className="data-[state=active]:bg-primary/10">
                                            <Info className="h-4 w-4 mr-2" />
                                            Info
                                        </TabsTrigger>
                                        <TabsTrigger value="services" className="data-[state=active]:bg-primary/10">
                                            <Wrench className="h-4 w-4 mr-2" />
                                            Services ({selectedCar.ServiceHistory.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="accidents" className="data-[state=active]:bg-primary/10">
                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                            Accidents ({selectedCar.Accidents.length})
                                        </TabsTrigger>
                                    </TabsList>

                                    <ScrollArea className="h-[60vh]">
                                        {/* Info Tab */}
                                        <TabsContent value="info" className="p-6 space-y-6 mt-0">
                                            {/* Specifications */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Specifications</h4>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                                        <Settings className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Engine Size</p>
                                                            <p className="text-sm font-medium">
                                                                {selectedCar.EngineSize > 0 ? `${selectedCar.EngineSize}L` : "Electric"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                                        <Fuel className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Fuel Type</p>
                                                            <Badge variant="outline" className={`${fuelTypeColors[selectedCar.FuelType]} mt-0.5`}>
                                                                {selectedCar.FuelType}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Year</p>
                                                            <p className="text-sm font-medium">{selectedCar.YearOfManufacturing}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                                        <Gauge className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Mileage</p>
                                                            <p className="text-sm font-medium">{selectedCar.Mileage.toLocaleString()} mi</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 col-span-2">
                                                        <PoundSterling className="h-4 w-4 text-accent" />
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Price</p>
                                                            <p className="text-lg font-bold text-accent">£{selectedCar.Price.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Features</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedCar.Features.map((feature) => (
                                                        <Badge key={feature} variant="secondary" className="text-xs">
                                                            {feature}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Dealer Info */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Dealer</h4>
                                                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                    <div>
                                                        <p className="text-sm font-medium">{selectedCar.DealerName}</p>
                                                        <p className="text-xs text-muted-foreground">{selectedCar.DealerCity}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Service Summary */}
                                            {carSummary && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">Service Summary</h4>
                                                    <div className="grid grid-cols-4 gap-2 text-sm">
                                                        <div className="p-3 rounded bg-muted/50">
                                                            <p className="text-xs text-muted-foreground">Total Services</p>
                                                            <p className="font-medium text-lg">{carSummary.totalServices}</p>
                                                        </div>
                                                        <div className="p-3 rounded bg-muted/50">
                                                            <p className="text-xs text-muted-foreground">Total Cost</p>
                                                            <p className="font-medium">£{carSummary.totalServiceCost.toLocaleString()}</p>
                                                        </div>
                                                        <div className="p-3 rounded bg-muted/50">
                                                            <p className="text-xs text-muted-foreground">Latest Type</p>
                                                            <p className="font-medium">{carSummary.latestServiceType}</p>
                                                        </div>
                                                        <div className="p-3 rounded bg-muted/50">
                                                            <p className="text-xs text-muted-foreground">Latest Date</p>
                                                            <p className="font-medium">{carSummary.latestServiceDate}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Accident Summary */}
                                            {carSummary && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">Accident Summary</h4>
                                                    <div className="grid grid-cols-4 gap-2 text-sm">
                                                        <div className="p-3 rounded bg-muted/50">
                                                            <p className="text-xs text-muted-foreground">Total Accidents</p>
                                                            <p className="font-medium text-lg">{carSummary.totalAccidents}</p>
                                                        </div>
                                                        <div className="p-3 rounded bg-muted/50">
                                                            <p className="text-xs text-muted-foreground">Repair Cost</p>
                                                            <p className="font-medium">£{carSummary.totalRepairCost.toLocaleString()}</p>
                                                        </div>
                                                        <div className="p-3 rounded bg-muted/50">
                                                            <p className="text-xs text-muted-foreground">Latest Date</p>
                                                            <p className="font-medium">{carSummary.latestAccidentDate}</p>
                                                        </div>
                                                        <div className="p-3 rounded bg-muted/50">
                                                            <p className="text-xs text-muted-foreground">Highest Severity</p>
                                                            {carSummary.highestSeverity ? (
                                                                <Badge variant="outline" className={severityColors[carSummary.highestSeverity]}>
                                                                    {carSummary.highestSeverity}
                                                                </Badge>
                                                            ) : (
                                                                <p className="font-medium">N/A</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>

                                        {/* Services Tab */}
                                        <TabsContent value="services" className="p-6 mt-0">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-semibold">Service Records</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">Sort by:</span>
                                                    <Select
                                                        value={`${serviceSortField}-${serviceSortDirection}`}
                                                        onValueChange={(v) => {
                                                            const [field, dir] = v.split("-") as ["date" | "cost", SortDirection]
                                                            setServiceSortField(field)
                                                            setServiceSortDirection(dir)
                                                        }}
                                                    >
                                                        <SelectTrigger className="h-7 text-xs w-[120px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="date-desc">Date (Newest)</SelectItem>
                                                            <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                                                            <SelectItem value="cost-desc">Cost (High)</SelectItem>
                                                            <SelectItem value="cost-asc">Cost (Low)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {sortedServices.length > 0 ? (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="border-border">
                                                            <TableHead className="text-xs">Service ID</TableHead>
                                                            <TableHead className="text-xs">Date</TableHead>
                                                            <TableHead className="text-xs">Type</TableHead>
                                                            <TableHead className="text-xs text-right">Cost</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {sortedServices.map((service) => (
                                                            <TableRow key={service.ServiceID} className="border-border">
                                                                <TableCell className="font-mono text-xs">{service.ServiceID}</TableCell>
                                                                <TableCell className="text-xs">{service.DateOfService}</TableCell>
                                                                <TableCell className="text-xs">{service.ServiceType}</TableCell>
                                                                <TableCell className="text-xs text-right font-semibold">
                                                                    £{service.CostOfService}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No service records</p>
                                                </div>
                                            )}
                                        </TabsContent>

                                        {/* Accidents Tab */}
                                        <TabsContent value="accidents" className="p-6 mt-0">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-semibold">Accident Records</h4>
                                                <Select value={accidentSeverityFilter} onValueChange={setAccidentSeverityFilter}>
                                                    <SelectTrigger className="h-7 text-xs w-[120px]">
                                                        <SelectValue placeholder="Severity" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All</SelectItem>
                                                        <SelectItem value="Minor">Minor</SelectItem>
                                                        <SelectItem value="Moderate">Moderate</SelectItem>
                                                        <SelectItem value="Major">Major</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {filteredAccidents.length > 0 ? (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="border-border">
                                                            <TableHead className="text-xs">ID</TableHead>
                                                            <TableHead className="text-xs">Date</TableHead>
                                                            <TableHead className="text-xs">Description</TableHead>
                                                            <TableHead className="text-xs">Severity</TableHead>
                                                            <TableHead className="text-xs text-right">Cost</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {filteredAccidents.map((accident) => (
                                                            <TableRow key={accident.AccidentID} className="border-border">
                                                                <TableCell className="font-mono text-xs">{accident.AccidentID}</TableCell>
                                                                <TableCell className="text-xs">{accident.DateOfAccident}</TableCell>
                                                                <TableCell className="text-xs max-w-[150px] truncate" title={accident.Description}>
                                                                    {accident.Description}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline" className={`text-xs ${severityColors[accident.Severity]}`}>
                                                                        {accident.Severity}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-xs text-right font-semibold">
                                                                    £{accident.CostOfRepair}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No accident records</p>
                                                </div>
                                            )}
                                        </TabsContent>
                                    </ScrollArea>
                                </Tabs>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
