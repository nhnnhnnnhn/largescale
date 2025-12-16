"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { useSearchCarsMutation, useGetCarHistoryQuery } from "@/store/services/carsApi"
import { useGetDealersQuery } from "@/store/services/dealersApi"
import { transformCars, transformCarHistory } from "@/lib/transformers"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
    ArrowUp,
    ArrowDown,
    Wrench,
    Info,
    Check,
} from "lucide-react"
import type { CarRecord } from "@/lib/car-data"

const FETCH_ALL_LIMIT = 15000 // Fetch all data for client-side filtering

type SortField = "CarID" | "Manufacturer" | "Year" | "Price" | "Mileage" | "Accidents" | "Services"
type SortDirection = "asc" | "desc"

// Format date string to a cleaner format: "DD/MM/YYYY HH:mm"
const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString

        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')

        return `${day}/${month}/${year} ${hours}:${minutes}`
    } catch {
        return dateString
    }
}

export default function CarsPage() {
    // Mutations and queries
    const [searchCars, { data: searchResponse, isLoading: carsLoading, error: carsError }] = useSearchCarsMutation()
    const { data: dealersData, isLoading: dealersLoading } = useGetDealersQuery()

    // Filter state - inline column filters
    const [carIdSearch, setCarIdSearch] = useState<string>("")
    const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([])
    const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]) // Multi-select
    const [yearStart, setYearStart] = useState<string>("") // Number input
    const [yearEnd, setYearEnd] = useState<string>("") // Number input
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
    const [selectedDealerIds, setSelectedDealerIds] = useState<string[]>([]) // Multi-select

    // Search & Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [pageInputValue, setPageInputValue] = useState("1")

    // Sorting State for Accidents and Services columns
    const [accidentSort, setAccidentSort] = useState<SortDirection | null>(null)
    const [serviceSort, setServiceSort] = useState<SortDirection | null>(null)

    // General sort state for backend
    const [sortField, setSortField] = useState<SortField>("CarID")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    // Selected Car State
    const [selectedCar, setSelectedCar] = useState<CarRecord | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Fetch car history when a car is selected
    const { data: carHistoryData, isLoading: historyLoading } = useGetCarHistoryQuery(
        selectedCar?.CarID || "",
        { skip: !selectedCar }
    )

    // Transform car history with dealer info
    const selectedCarWithHistory = useMemo(() => {
        if (!selectedCar || !carHistoryData?.data || !dealersData?.data) return selectedCar
        const dealersMap = new Map(dealersData.data.map((d) => [d.dealer_id, d]))
        const dealer = dealersMap.get(carHistoryData.data.car.dealer_id)
        return transformCarHistory(carHistoryData.data, dealer)
    }, [selectedCar, carHistoryData, dealersData])

    // Service/Accident Tab Sorting
    const [serviceSortField, setServiceSortField] = useState<"date" | "cost">("date")
    const [serviceSortDirection, setServiceSortDirection] = useState<SortDirection>("desc")
    const [accidentSeverityFilter, setAccidentSeverityFilter] = useState<string>("all")
    const [accidentSortField, setAccidentSortField] = useState<"date" | "cost">("date")
    const [accidentSortDirection, setAccidentSortDirection] = useState<SortDirection>("desc")

    // Fetch ALL data once on mount (no filter dependencies - filters applied client-side)
    useEffect(() => {
        searchCars({
            filters: {},
            page: 1,
            limit: FETCH_ALL_LIMIT, // Fetch all 15000 cars
        })
    }, [searchCars])

    // Sync page input value with current page
    useEffect(() => {
        setPageInputValue(currentPage.toString())
    }, [currentPage])

    // Transform backend data
    const cars = useMemo(() => {
        if (!searchResponse?.data || !dealersData?.data) return []
        const dealersMap = new Map(dealersData.data.map((d) => [d.dealer_id, d]))
        return transformCars(searchResponse.data, dealersMap)
    }, [searchResponse, dealersData])

    // Get filter options dynamically from actual car data
    const filterOptions = useMemo(() => {
        if (cars.length === 0) {
            return {
                manufacturers: [],
                fuelTypes: [],
                years: [],
                priceRange: { min: 0, max: 100000 },
                mileageRange: { min: 0, max: 200000 },
            }
        }

        // Extract unique values from cars data
        const manufacturers = [...new Set(cars.map(c => c.Manufacturer))].sort()
        const fuelTypes = [...new Set(cars.map(c => c.FuelType))].sort()
        const years = [...new Set(cars.map(c => c.YearOfManufacturing))].sort((a, b) => b - a)
        const prices = cars.map(c => c.Price)
        const mileages = cars.map(c => c.Mileage)

        return {
            manufacturers,
            fuelTypes,
            years,
            priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
            mileageRange: { min: Math.min(...mileages), max: Math.max(...mileages) },
        }
    }, [cars])

    // Get dealers list - only dealers that have cars in the data
    const dealersList = useMemo(() => {
        if (!dealersData?.data || cars.length === 0) return []

        // Get unique dealer names from cars
        const dealerNamesInCars = new Set(cars.map(c => c.DealerName))

        // Filter dealers to only those with cars
        return dealersData.data
            .filter(d => dealerNamesInCars.has(d.dealer_name))
            .map(d => ({ id: d.dealer_id, name: d.dealer_name, city: d.dealer_city }))
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [dealersData, cars])

    // Client-side filtering - ALL filters applied here for instant results
    const filteredCars = useMemo(() => {
        let result = [...cars]

        // CarID search filter
        if (carIdSearch.trim()) {
            const query = carIdSearch.trim().toLowerCase()
            result = result.filter(car => car.CarID.toLowerCase().includes(query))
        }

        // Manufacturer filter (multi-select)
        if (selectedManufacturers.length > 0) {
            result = result.filter(car => selectedManufacturers.includes(car.Manufacturer))
        }

        // Fuel type filter (multi-select)
        if (selectedFuelTypes.length > 0) {
            result = result.filter(car => selectedFuelTypes.includes(car.FuelType))
        }

        // Year range filter (number inputs)
        if (yearStart.trim()) {
            const startYear = parseInt(yearStart)
            if (!isNaN(startYear)) {
                result = result.filter(car => car.YearOfManufacturing >= startYear)
            }
        }
        if (yearEnd.trim()) {
            const endYear = parseInt(yearEnd)
            if (!isNaN(endYear)) {
                result = result.filter(car => car.YearOfManufacturing <= endYear)
            }
        }

        // Price range filter
        if (priceRange[0] > 0 || priceRange[1] < 100000) {
            result = result.filter(car => car.Price >= priceRange[0] && car.Price <= priceRange[1])
        }

        // Dealer filter (multi-select) - match by name since CarRecord uses DealerName
        if (selectedDealerIds.length > 0) {
            const selectedDealerNames = dealersList
                .filter(d => selectedDealerIds.includes(d.id))
                .map(d => d.name)
            result = result.filter(car => selectedDealerNames.includes(car.DealerName))
        }

        // Sort by accidents if set
        if (accidentSort) {
            result.sort((a, b) => {
                const aCount = a.AccidentCount ?? a.Accidents.length
                const bCount = b.AccidentCount ?? b.Accidents.length
                const diff = aCount - bCount
                return accidentSort === 'asc' ? diff : -diff
            })
        }

        // Sort by services if set
        if (serviceSort) {
            result.sort((a, b) => {
                const aCount = a.ServiceCount ?? a.ServiceHistory.length
                const bCount = b.ServiceCount ?? b.ServiceHistory.length
                const diff = aCount - bCount
                return serviceSort === 'asc' ? diff : -diff
            })
        }

        return result
    }, [cars, carIdSearch, selectedManufacturers, selectedFuelTypes, yearStart, yearEnd, priceRange, selectedDealerIds, dealersList, accidentSort, serviceSort])

    // Pagination constants
    const DISPLAY_PER_PAGE = 15

    // Client-side pagination - slice the filtered results
    const paginatedCars = useMemo(() => {
        const startIndex = (currentPage - 1) * DISPLAY_PER_PAGE
        const endIndex = startIndex + DISPLAY_PER_PAGE
        return filteredCars.slice(startIndex, endIndex)
    }, [filteredCars, currentPage])

    // Metadata - use filtered count for display
    const totalPages = Math.ceil(filteredCars.length / DISPLAY_PER_PAGE) || 1
    const totalCars = filteredCars.length

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [carIdSearch, selectedManufacturers, selectedFuelTypes, yearStart, yearEnd, priceRange, selectedDealerIds])

    // Toggle manufacturer in multi-select
    const toggleManufacturer = (manufacturer: string) => {
        setSelectedManufacturers(prev => {
            if (prev.includes(manufacturer)) {
                return prev.filter(m => m !== manufacturer)
            } else {
                return [...prev, manufacturer]
            }
        })
        setCurrentPage(1)
    }

    // Toggle fuel type in multi-select
    const toggleFuelType = (fuelType: string) => {
        setSelectedFuelTypes(prev => {
            if (prev.includes(fuelType)) {
                return prev.filter(f => f !== fuelType)
            } else {
                return [...prev, fuelType]
            }
        })
        setCurrentPage(1)
    }

    // Toggle dealer in multi-select
    const toggleDealer = (dealerId: string) => {
        setSelectedDealerIds(prev => {
            if (prev.includes(dealerId)) {
                return prev.filter(d => d !== dealerId)
            } else {
                return [...prev, dealerId]
            }
        })
        setCurrentPage(1)
    }

    // Sort handler for accidents column
    const toggleAccidentSort = () => {
        setServiceSort(null) // Clear other sort
        setAccidentSort(prev => {
            if (prev === null) return 'asc'
            if (prev === 'asc') return 'desc'
            return null
        })
    }

    // Sort handler for services column
    const toggleServiceSort = () => {
        setAccidentSort(null) // Clear other sort
        setServiceSort(prev => {
            if (prev === null) return 'asc'
            if (prev === 'asc') return 'desc'
            return null
        })
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
        if (!selectedCarWithHistory) return []
        return [...selectedCarWithHistory.ServiceHistory].sort((a, b) => {
            if (serviceSortField === "date") {
                return serviceSortDirection === "desc"
                    ? new Date(b.DateOfService).getTime() - new Date(a.DateOfService).getTime()
                    : new Date(a.DateOfService).getTime() - new Date(b.DateOfService).getTime()
            }
            return serviceSortDirection === "desc" ? b.CostOfService - a.CostOfService : a.CostOfService - b.CostOfService
        })
    }, [selectedCarWithHistory, serviceSortField, serviceSortDirection])

    // Filtered and Sorted Accidents
    const filteredAndSortedAccidents = useMemo(() => {
        if (!selectedCarWithHistory) return []

        // First filter by severity
        let accidents = selectedCarWithHistory.Accidents
        if (accidentSeverityFilter !== "all") {
            accidents = accidents.filter((a) => a.Severity === accidentSeverityFilter)
        }

        // Then sort
        return [...accidents].sort((a, b) => {
            if (accidentSortField === "date") {
                return accidentSortDirection === "desc"
                    ? new Date(b.DateOfAccident).getTime() - new Date(a.DateOfAccident).getTime()
                    : new Date(a.DateOfAccident).getTime() - new Date(b.DateOfAccident).getTime()
            }
            return accidentSortDirection === "desc"
                ? b.CostOfRepair - a.CostOfRepair
                : a.CostOfRepair - b.CostOfRepair
        })
    }, [selectedCarWithHistory, accidentSeverityFilter, accidentSortField, accidentSortDirection])

    // Calculate summaries for selected car
    const carSummary = useMemo(() => {
        if (!selectedCarWithHistory) return null

        const services = selectedCarWithHistory.ServiceHistory
        const accidents = selectedCarWithHistory.Accidents

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
                    const severityOrder: Record<string, number> = { Minor: 1, Moderate: 2, Major: 3, Severe: 4 }
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
    }, [selectedCarWithHistory])

    const fuelTypeColors: Record<string, string> = {
        Petrol: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
        Diesel: "bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30",
        Hybrid: "bg-teal-500/20 text-teal-700 dark:text-teal-400 border-teal-500/30",
        Electric: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
    }

    const severityColors: Record<string, string> = {
        Minor: "bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30",
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
        <div className="min-h-screen bg-gray-50">
            {/* Header - same height as sidebar header (h-16) */}
            <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Cars</h1>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-hidden flex flex-col">
                <Card className="bg-card border-border flex-1 flex flex-col overflow-hidden">
                    <CardHeader className="pb-4 flex-shrink-0">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Car className="h-4 w-4 text-primary" />
                                Vehicle Inventory
                                <Badge variant="secondary" className="ml-2">
                                    {totalCars} vehicles
                                </Badge>
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                        <div className="flex-1 min-h-0">
                            <ScrollArea className="h-full">
                                <Table>
                                    {/* Table Header with Popover Filters */}
                                    <TableHeader className="sticky top-0 bg-card z-10">
                                        <TableRow className="border-border hover:bg-transparent">
                                            {/* CarID Column */}
                                            <TableHead className="w-[130px]">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-medium">Car ID</span>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 ${carIdSearch ? 'text-primary' : 'text-muted-foreground'}`}>
                                                                <Search className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-64 p-3" align="start">
                                                            <div className="space-y-2">
                                                                <Input
                                                                    placeholder="Enter Car ID"
                                                                    className="h-8"
                                                                    value={carIdSearch}
                                                                    onChange={(e) => {
                                                                        setCarIdSearch(e.target.value)
                                                                        setCurrentPage(1)
                                                                    }}
                                                                />
                                                                {carIdSearch && (
                                                                    <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => { setCarIdSearch(""); setCurrentPage(1) }}>
                                                                        <X className="h-3 w-3 mr-1" /> Xóa
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </TableHead>

                                            {/* Manufacturer Column */}
                                            <TableHead className="w-[140px]">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-medium">Manufacturer</span>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 ${selectedManufacturers.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                                <Filter className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-56 p-3" align="start">
                                                            <div className="space-y-2">
                                                                <div className="max-h-48 overflow-y-auto space-y-1">
                                                                    {filterOptions.manufacturers.map((m) => (
                                                                        <div
                                                                            key={m}
                                                                            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                                                                            onClick={() => toggleManufacturer(m)}
                                                                        >
                                                                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedManufacturers.includes(m) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                                                                {selectedManufacturers.includes(m) && <Check className="h-3 w-3 text-primary-foreground" />}
                                                                            </div>
                                                                            <span className="text-sm">{m}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {selectedManufacturers.length > 0 && (
                                                                    <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => { setSelectedManufacturers([]); setCurrentPage(1) }}>
                                                                        <X className="h-3 w-3 mr-1" /> Reset
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </TableHead>

                                            {/* Model Column */}
                                            <TableHead className="w-[100px]">
                                                <span className="text-xs font-medium">Model</span>
                                            </TableHead>

                                            {/* Year Column - Number Inputs */}
                                            <TableHead className="w-[90px]">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-medium">Year</span>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 ${yearStart || yearEnd ? 'text-primary' : 'text-muted-foreground'}`}>
                                                                <Filter className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-56 p-3" align="start">
                                                            <div className="space-y-3">
                                                                <div className="flex gap-2 items-center">
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="From"
                                                                        className="h-8 flex-1"
                                                                        value={yearStart}
                                                                        onChange={(e) => setYearStart(e.target.value)}
                                                                    />
                                                                    <span className="text-muted-foreground">→</span>
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="To"
                                                                        className="h-8 flex-1"
                                                                        value={yearEnd}
                                                                        onChange={(e) => setYearEnd(e.target.value)}
                                                                    />
                                                                </div>
                                                                {(yearStart || yearEnd) && (
                                                                    <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => { setYearStart(''); setYearEnd(''); setCurrentPage(1) }}>
                                                                        <X className="h-3 w-3 mr-1" /> Reset
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </TableHead>

                                            {/* Price Column */}
                                            <TableHead className="w-[110px]">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-medium">Price</span>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 ${priceRange[0] > 0 || priceRange[1] < 100000 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                                <Filter className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-72 p-3" align="start">
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between">
                                                                    <span className="text-xs font-medium text-muted-foreground">Price Range</span>
                                                                    <span className="text-xs font-mono text-primary">
                                                                        £{priceRange[0].toLocaleString()} - £{priceRange[1].toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <Slider
                                                                    min={0}
                                                                    max={100000}
                                                                    step={1000}
                                                                    value={priceRange}
                                                                    onValueChange={(value) => setPriceRange(value as [number, number])}
                                                                    onValueCommit={() => setCurrentPage(1)}
                                                                />
                                                                {(priceRange[0] > 0 || priceRange[1] < 100000) && (
                                                                    <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => { setPriceRange([0, 100000]); setCurrentPage(1) }}>
                                                                        <X className="h-3 w-3 mr-1" /> Reset
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </TableHead>

                                            {/* Fuel Type Column */}
                                            {/* Fuel Type Column - Multi-select */}
                                            <TableHead className="w-[100px]">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-medium">Fuel</span>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 ${selectedFuelTypes.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                                <Filter className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-48 p-3" align="start">
                                                            <div className="space-y-2">
                                                                <div className="space-y-1">
                                                                    {filterOptions.fuelTypes.map((f) => (
                                                                        <div
                                                                            key={f}
                                                                            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                                                                            onClick={() => toggleFuelType(f)}
                                                                        >
                                                                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedFuelTypes.includes(f) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                                                                {selectedFuelTypes.includes(f) && <Check className="h-3 w-3 text-primary-foreground" />}
                                                                            </div>
                                                                            <span className="text-sm">{f}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {selectedFuelTypes.length > 0 && (
                                                                    <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => { setSelectedFuelTypes([]); setCurrentPage(1) }}>
                                                                        <X className="h-3 w-3 mr-1" /> Reset
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </TableHead>

                                            {/* Accidents Column with Sort */}
                                            <TableHead className="w-[100px]">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-medium">Accidents</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`h-6 w-6 p-0 ${accidentSort ? 'text-primary' : 'text-muted-foreground'}`}
                                                        onClick={toggleAccidentSort}
                                                    >
                                                        {accidentSort === 'asc' && <ArrowUp className="h-3.5 w-3.5" />}
                                                        {accidentSort === 'desc' && <ArrowDown className="h-3.5 w-3.5" />}
                                                        {!accidentSort && <ArrowUpDown className="h-3.5 w-3.5" />}
                                                    </Button>
                                                </div>
                                            </TableHead>

                                            {/* Services Column with Sort */}
                                            <TableHead className="w-[100px]">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-medium">Services</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`h-6 w-6 p-0 ${serviceSort ? 'text-primary' : 'text-muted-foreground'}`}
                                                        onClick={toggleServiceSort}
                                                    >
                                                        {serviceSort === 'asc' && <ArrowUp className="h-3.5 w-3.5" />}
                                                        {serviceSort === 'desc' && <ArrowDown className="h-3.5 w-3.5" />}
                                                        {!serviceSort && <ArrowUpDown className="h-3.5 w-3.5" />}
                                                    </Button>
                                                </div>
                                            </TableHead>

                                            {/* Dealer Column - Multi-select */}
                                            <TableHead className="w-[140px]">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-medium">Dealer</span>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 ${selectedDealerIds.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                                <Filter className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-64 p-3" align="end">
                                                            <div className="space-y-2">
                                                                <div className="max-h-48 overflow-y-auto space-y-1">
                                                                    {dealersList.map((d) => (
                                                                        <div
                                                                            key={d.id}
                                                                            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                                                                            onClick={() => toggleDealer(d.id)}
                                                                        >
                                                                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedDealerIds.includes(d.id) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                                                                {selectedDealerIds.includes(d.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                                                                            </div>
                                                                            <span className="text-sm truncate">{d.name}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {selectedDealerIds.length > 0 && (
                                                                    <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => { setSelectedDealerIds([]); setCurrentPage(1) }}>
                                                                        <X className="h-3 w-3 mr-1" /> Bỏ lọc
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedCars.map((car) => (
                                            <TableRow
                                                key={car.CarID}
                                                className="border-border cursor-pointer transition-colors hover:bg-muted/50"
                                                onClick={() => handleCarSelect(car)}
                                            >
                                                <TableCell className="font-mono text-xs text-primary">{car.CarID}</TableCell>
                                                <TableCell className="font-medium">{car.Manufacturer}</TableCell>
                                                <TableCell>{car.Model}</TableCell>
                                                <TableCell>{car.YearOfManufacturing}</TableCell>
                                                <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">£{car.Price.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={fuelTypeColors[car.FuelType]}>
                                                        {car.FuelType}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={(car.AccidentCount ?? car.Accidents.length) > 0 ? "destructive" : "secondary"} className="text-xs">
                                                        {car.AccidentCount ?? car.Accidents.length}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {car.ServiceCount ?? car.ServiceHistory.length}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{car.DealerName}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>

                        <div className="px-4 h-12 border-t border-border flex items-center justify-between flex-shrink-0">
                            <p className="text-sm text-muted-foreground leading-none">
                                Showing {filteredCars.length > 0 ? (currentPage - 1) * DISPLAY_PER_PAGE + 1 : 0} -{" "}
                                {Math.min(currentPage * DISPLAY_PER_PAGE, totalCars)} of {totalCars} vehicles
                            </p>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm text-muted-foreground leading-none">Page</span>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={totalPages || 1}
                                        value={pageInputValue}
                                        onChange={(e) => setPageInputValue(e.target.value)}
                                        onBlur={(e) => {
                                            const page = parseInt(e.target.value)
                                            if (!isNaN(page) && page >= 1 && page <= (totalPages || 1)) {
                                                setCurrentPage(page)
                                            } else {
                                                setPageInputValue(currentPage.toString())
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                const page = parseInt(pageInputValue)
                                                if (!isNaN(page) && page >= 1 && page <= (totalPages || 1)) {
                                                    setCurrentPage(page)
                                                    e.currentTarget.blur()
                                                } else {
                                                    setPageInputValue(currentPage.toString())
                                                }
                                            }
                                        }}
                                        className="h-7 w-14 text-center text-sm"
                                    />
                                    <span className="text-sm text-muted-foreground leading-none">of {totalPages || 1}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
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

                                {historyLoading ? (
                                    <div className="flex items-center justify-center h-96">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                            <p className="text-sm text-muted-foreground">Loading vehicle history...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <Tabs defaultValue="info" className="w-full">
                                        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-6">
                                            <TabsTrigger value="info" className="data-[state=active]:bg-primary/10">
                                                <Info className="h-4 w-4 mr-2" />
                                                Info
                                            </TabsTrigger>
                                            <TabsTrigger value="services" className="data-[state=active]:bg-primary/10">
                                                <Wrench className="h-4 w-4 mr-2" />
                                                Services ({selectedCarWithHistory?.ServiceHistory.length || 0})
                                            </TabsTrigger>
                                            <TabsTrigger value="accidents" className="data-[state=active]:bg-primary/10">
                                                <AlertTriangle className="h-4 w-4 mr-2" />
                                                Accidents ({selectedCarWithHistory?.Accidents.length || 0})
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
                                                            <PoundSterling className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Price</p>
                                                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">£{selectedCar.Price.toLocaleString()}</p>
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
                                                                <p className="font-medium">{carSummary.latestServiceDate !== "N/A" ? formatDate(carSummary.latestServiceDate) : "N/A"}</p>
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
                                                                <p className="font-medium">{carSummary.latestAccidentDate !== "N/A" ? formatDate(carSummary.latestAccidentDate) : "N/A"}</p>
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
                                                                    <TableCell className="text-xs">{formatDate(service.DateOfService)}</TableCell>
                                                                    <TableCell className="text-xs">{service.ServiceType}</TableCell>
                                                                    <TableCell className="text-xs text-right font-semibold">
                                                                        £{service.CostOfService.toLocaleString()}
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
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">Sort by:</span>
                                                        <Select
                                                            value={`${accidentSortField}-${accidentSortDirection}`}
                                                            onValueChange={(v) => {
                                                                const [field, dir] = v.split("-") as ["date" | "cost", SortDirection]
                                                                setAccidentSortField(field)
                                                                setAccidentSortDirection(dir)
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

                                                {filteredAndSortedAccidents.length > 0 ? (
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
                                                            {filteredAndSortedAccidents.map((accident) => (
                                                                <TableRow key={accident.AccidentID} className="border-border">
                                                                    <TableCell className="font-mono text-xs">{accident.AccidentID}</TableCell>
                                                                    <TableCell className="text-xs">{formatDate(accident.DateOfAccident)}</TableCell>
                                                                    <TableCell className="text-xs w-[150px] break-words whitespace-normal">
                                                                        {accident.Description}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline" className={`text-xs ${severityColors[accident.Severity]}`}>
                                                                            {accident.Severity}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell className="text-xs text-right font-semibold">
                                                                        £{accident.CostOfRepair.toLocaleString()}
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
                                )}
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
