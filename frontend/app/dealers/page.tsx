"use client"

import type React from "react"

import { useMemo, useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Building2, Car, MapPin, DollarSign, Search, ArrowUpDown, X, Filter, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { useGetDealersQuery, useGetDealerInventoryQuery, useGetDealersStatsQuery } from "@/store/services/dealersApi"
import { useGetOverviewQuery } from "@/store/services/analyticsApi"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts"

interface DealerStats {
    dealer_id: string
    dealer_name: string
    dealer_city: string
    latitude: number
    longitude: number
}

type SortField = "name" | "city" | "total_cars" | "average_price"
type SortDirection = "asc" | "desc"

export default function DealersPage() {
    // Column filter state
    const [dealerIdSearch, setDealerIdSearch] = useState("")
    const [dealerNameSearch, setDealerNameSearch] = useState("")
    const [selectedCities, setSelectedCities] = useState<string[]>([])

    // Sort state
    const [sortField, setSortField] = useState<SortField>("name")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageInputValue, setPageInputValue] = useState("1")
    const DEALERS_PER_PAGE = 12

    // Dialog state
    const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null)

    // Fetch dealers from backend
    const { data: dealersData, isLoading: dealersLoading, error: dealersError } = useGetDealersQuery()
    const { data: overviewData } = useGetOverviewQuery()
    const { data: dealersStatsData } = useGetDealersStatsQuery()

    // Fetch inventory for selected dealer
    const { data: inventoryData, isLoading: inventoryLoading } = useGetDealerInventoryQuery(
        { id: selectedDealerId!, page: 1, limit: 500 },
        { skip: !selectedDealerId }
    )

    const dealers = dealersData?.data || []

    // Get unique cities for filter dropdown
    const cityOptions = useMemo(() => {
        if (dealers.length === 0) return []
        return [...new Set(dealers.map(d => d.dealer_city))].sort()
    }, [dealers])

    // Toggle city in multi-select
    const toggleCity = (city: string) => {
        setSelectedCities(prev => {
            if (prev.includes(city)) {
                return prev.filter(c => c !== city)
            } else {
                return [...prev, city]
            }
        })
    }


    // Check if any filter is active
    const hasActiveFilters = dealerIdSearch || dealerNameSearch || selectedCities.length > 0

    const filteredDealers = useMemo(() => {
        let result = [...dealers]

        // Dealer ID search filter
        if (dealerIdSearch.trim()) {
            const query = dealerIdSearch.trim().toLowerCase()
            result = result.filter(dealer => dealer.dealer_id.toLowerCase().includes(query))
        }

        // Dealer Name search filter
        if (dealerNameSearch.trim()) {
            const query = dealerNameSearch.trim().toLowerCase()
            result = result.filter(dealer => dealer.dealer_name.toLowerCase().includes(query))
        }

        // City multi-select filter
        if (selectedCities.length > 0) {
            result = result.filter(dealer => selectedCities.includes(dealer.dealer_city))
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0
            switch (sortField) {
                case "name":
                    comparison = a.dealer_name.localeCompare(b.dealer_name)
                    break
                case "city":
                    comparison = a.dealer_city.localeCompare(b.dealer_city)
                    break
                case "total_cars":
                    comparison = 0  // Will calculate from cars API
                    break
                case "average_price":
                    comparison = 0  // Will calculate from cars API
                    break
            }
            return sortDirection === "desc" ? -comparison : comparison
        })

        return result
    }, [dealers, dealerIdSearch, dealerNameSearch, selectedCities, sortField, sortDirection])

    // Pagination
    const totalPages = Math.ceil(filteredDealers.length / DEALERS_PER_PAGE)
    const paginatedDealers = useMemo(() => {
        const startIndex = (currentPage - 1) * DEALERS_PER_PAGE
        return filteredDealers.slice(startIndex, startIndex + DEALERS_PER_PAGE)
    }, [filteredDealers, currentPage])

    // Sync page input with current page
    useEffect(() => {
        setPageInputValue(currentPage.toString())
    }, [currentPage])

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    const selectedDealer = dealers.find(d => d.dealer_id === selectedDealerId)

    // Calculate total cars and avg price from inventory
    const dealerStats = useMemo(() => {
        if (!inventoryData?.data) return { totalCars: 0, avgPrice: 0 }

        // Use metadata.total for accurate count from database
        const totalCars = inventoryData.data.metadata?.total || inventoryData.data.cars?.length || 0

        // Calculate avg price from returned cars
        const cars = inventoryData.data.cars || []
        const totalPrice = cars.reduce((sum: number, car: any) => sum + (car.price || 0), 0)
        const avgPrice = cars.length > 0 ? Math.round(totalPrice / cars.length) : 0

        return { totalCars, avgPrice }
    }, [inventoryData])

    // Calculate fuel distribution from inventory - for Bar Chart
    const fuelChartData = useMemo(() => {
        if (!inventoryData?.data?.cars) return []

        const distribution: Record<string, number> = {}
        inventoryData.data.cars.forEach((car: any) => {
            const fuelType = car.fuel_type || 'Unknown'
            distribution[fuelType] = (distribution[fuelType] || 0) + 1
        })

        return Object.entries(distribution)
            .map(([fuelType, count]) => ({ fuelType, count }))
            .sort((a, b) => b.count - a.count)
    }, [inventoryData])

    // Calculate year distribution from inventory - for Bar Chart
    const yearDistributionData = useMemo(() => {
        if (!inventoryData?.data?.cars) return []

        const distribution: Record<number, number> = {}
        inventoryData.data.cars.forEach((car: any) => {
            const year = car.year_of_manufacturing || 0
            if (year > 0) {
                distribution[year] = (distribution[year] || 0) + 1
            }
        })

        return Object.entries(distribution)
            .map(([year, count]) => ({ year: parseInt(year), count }))
            .sort((a, b) => a.year - b.year)
    }, [inventoryData])

    const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
        <TableHead className="cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort(field)}>
            <div className="flex items-center gap-1">
                {children}
                <ArrowUpDown className={`h-3 w-3 ${sortField === field ? "text-primary" : "text-muted-foreground"}`} />
            </div>
        </TableHead>
    )

    // Chart colors - deep blue theme
    const COLORS = [
        "oklch(0.45 0.18 230)",
        "oklch(0.5 0.16 215)",
        "oklch(0.4 0.2 240)",
        "oklch(0.55 0.14 200)",
        "oklch(0.35 0.15 250)",
    ]

    if (dealersLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (dealersError) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-muted-foreground">Failed to load dealers</p>
                    <p className="text-sm text-muted-foreground mt-2">Please check if the backend is running</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Header - fixed height */}
            <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center flex-shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Dealers</h1>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-hidden flex flex-col space-y-4">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-card border-border">
                        <CardContent className="py-1 px-2">
                            <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded bg-primary/10">
                                    <Building2 className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <p className="text-sm text-muted-foreground">Total Dealers</p>
                                    <p className="text-base font-bold">{dealers.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardContent className="py-1 px-2">
                            <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded bg-accent/10">
                                    <Car className="h-5 w-5 text-accent" />
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <p className="text-sm text-muted-foreground">Total Cars</p>
                                    <p className="text-base font-bold">{overviewData?.data?.total_cars || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardContent className="py-1 px-2">
                            <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded bg-chart-3/10">
                                    <DollarSign className="h-5 w-5 text-chart-3" />
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <p className="text-sm text-muted-foreground">Avg Size</p>
                                    <p className="text-base font-bold">
                                        {dealers.length > 0 ? Math.round((overviewData?.data?.total_cars || 0) / dealers.length) : 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardContent className="py-1 px-2">
                            <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded bg-chart-4/10">
                                    <DollarSign className="h-5 w-5 text-chart-4" />
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <p className="text-sm text-muted-foreground">Avg Price</p>
                                    <p className="text-base font-bold">£{overviewData?.data?.average_price?.toLocaleString() || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dealers Table */}
                <Card className="bg-card border-border flex-1 flex flex-col overflow-hidden">
                    <CardHeader className="pb-3 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-base">Dealer List</CardTitle>
                                <Badge variant="secondary">{filteredDealers.length} dealers</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                    <Badge variant="secondary" className="text-xs">Filters active</Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-auto">
                        <div>
                            <Table>
                                <TableHeader className="sticky top-0 bg-card z-10">
                                    <TableRow className="border-border hover:bg-transparent">
                                        {/* Dealer ID Column with Search Filter */}
                                        <TableHead className="w-[120px]">
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-medium">Dealer ID</span>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 ${dealerIdSearch ? 'text-primary' : 'text-muted-foreground'}`}>
                                                            <Search className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-64 p-3" align="start">
                                                        <div className="space-y-2">
                                                            <Input
                                                                placeholder="Enter Dealer ID"
                                                                className="h-8"
                                                                value={dealerIdSearch}
                                                                onChange={(e) => setDealerIdSearch(e.target.value)}
                                                            />
                                                            {dealerIdSearch && (
                                                                <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => setDealerIdSearch('')}>
                                                                    <X className="h-3 w-3 mr-1" /> Reset
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </TableHead>

                                        {/* Dealer Name Column with Search Filter */}
                                        <TableHead>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-medium">Dealer Name</span>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 ${dealerNameSearch ? 'text-primary' : 'text-muted-foreground'}`}>
                                                            <Search className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-64 p-3" align="start">
                                                        <div className="space-y-2">
                                                            <Input
                                                                placeholder="Enter Dealer Name"
                                                                className="h-8"
                                                                value={dealerNameSearch}
                                                                onChange={(e) => setDealerNameSearch(e.target.value)}
                                                            />
                                                            {dealerNameSearch && (
                                                                <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => setDealerNameSearch('')}>
                                                                    <X className="h-3 w-3 mr-1" /> Reset
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleSort("name")}>
                                                    <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "name" ? "text-primary" : "text-muted-foreground"}`} />
                                                </Button>
                                            </div>
                                        </TableHead>

                                        {/* City Column with Multi-select Filter */}
                                        <TableHead>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-medium">City</span>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 ${selectedCities.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                            <Filter className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-56 p-3" align="start">
                                                        <div className="space-y-2">
                                                            <div className="max-h-48 overflow-y-auto space-y-1">
                                                                {cityOptions.map((city) => (
                                                                    <div
                                                                        key={city}
                                                                        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                                                                        onClick={() => toggleCity(city)}
                                                                    >
                                                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedCities.includes(city) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                                                            {selectedCities.includes(city) && <Check className="h-3 w-3 text-primary-foreground" />}
                                                                        </div>
                                                                        <span className="text-sm">{city}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {selectedCities.length > 0 && (
                                                                <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => setSelectedCities([])}>
                                                                    <X className="h-3 w-3 mr-1" /> Reset
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleSort("city")}>
                                                    <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "city" ? "text-primary" : "text-muted-foreground"}`} />
                                                </Button>
                                            </div>
                                        </TableHead>

                                        {/* Total Cars Column */}
                                        <TableHead className="w-[100px]">
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-medium">Total Cars</span>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleSort("total_cars")}>
                                                    <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "total_cars" ? "text-primary" : "text-muted-foreground"}`} />
                                                </Button>
                                            </div>
                                        </TableHead>

                                        {/* Avg Price Column */}
                                        <TableHead className="w-[100px]">
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-medium">Avg Price</span>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleSort("average_price")}>
                                                    <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "average_price" ? "text-primary" : "text-muted-foreground"}`} />
                                                </Button>
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedDealers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No dealers found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedDealers.map((dealer) => {
                                            const stats = dealersStatsData?.data?.[dealer.dealer_id]
                                            return (
                                                <TableRow
                                                    key={dealer.dealer_id}
                                                    className="border-border cursor-pointer transition-colors hover:bg-muted/50"
                                                    onClick={() => setSelectedDealerId(dealer.dealer_id)}
                                                >
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {dealer.dealer_id}
                                                    </TableCell>
                                                    <TableCell className="font-medium">{dealer.dealer_name}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {dealer.dealer_city}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{stats?.total_cars ?? '-'}</Badge>
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-primary">
                                                        {stats?.avg_price ? `£${stats.avg_price.toLocaleString()}` : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>

                    {/* Pagination Controls */}
                    <div className="px-4 h-12 border-t border-border flex items-center justify-between flex-shrink-0">
                        <p className="text-sm text-muted-foreground leading-none">
                            Showing {filteredDealers.length > 0 ? ((currentPage - 1) * DEALERS_PER_PAGE) + 1 : 0} -{" "}
                            {Math.min(currentPage * DEALERS_PER_PAGE, filteredDealers.length)} of {filteredDealers.length} dealers
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Dealer Detail Modal */}
            <Dialog open={!!selectedDealerId} onOpenChange={(open) => !open && setSelectedDealerId(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-card border-border">
                    <DialogHeader className="pb-4 border-b border-border">
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            {selectedDealer?.dealer_name}
                        </DialogTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {selectedDealer?.dealer_city}
                        </div>
                    </DialogHeader>

                    {selectedDealer && (
                        <div className="flex-1 overflow-y-auto p-1 space-y-6">
                            {inventoryLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Dealer Info - 3 cards */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <p className="text-xs text-muted-foreground mb-1">Total Cars</p>
                                            <p className="text-2xl font-bold">{dealerStats.totalCars}</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <p className="text-xs text-muted-foreground mb-1">Avg Price</p>
                                            <p className="text-2xl font-bold text-primary">
                                                £{dealerStats.avgPrice.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <p className="text-xs text-muted-foreground mb-1">Location</p>
                                            <p className="text-sm font-mono">
                                                {selectedDealer.latitude?.toFixed(4)},{" "}
                                                {selectedDealer.longitude?.toFixed(4)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Charts */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Year Distribution Bar Chart */}
                                        <Card className="bg-muted/30 border-border">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm">Year Distribution</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="h-[200px] min-h-[200px]">
                                                    {!inventoryLoading && yearDistributionData.length > 0 ? (
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart
                                                                data={yearDistributionData}
                                                                margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                                                            >
                                                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0 0)" vertical={false} />
                                                                <XAxis
                                                                    dataKey="year"
                                                                    tick={{ fill: "oklch(0.45 0 0)", fontSize: 10 }}
                                                                    axisLine={{ stroke: "oklch(0.88 0 0)" }}
                                                                    tickLine={false}
                                                                    interval="preserveStartEnd"
                                                                />
                                                                <YAxis
                                                                    tick={{ fill: "oklch(0.45 0 0)", fontSize: 10 }}
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    width={25}
                                                                />
                                                                <Tooltip
                                                                    contentStyle={{
                                                                        backgroundColor: "oklch(1 0 0)",
                                                                        border: "1px solid oklch(0.88 0 0)",
                                                                        borderRadius: "8px",
                                                                        color: "oklch(0.145 0 0)",
                                                                    }}
                                                                    labelStyle={{ color: "oklch(0.145 0 0)" }}
                                                                    formatter={(value: number) => [`${value} cars`, "Count"]}
                                                                />
                                                                <Bar dataKey="count" fill="oklch(0.45 0.18 230)" radius={[4, 4, 0, 0]} />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                                            No data available
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Fuel Type Bar Chart */}
                                        <Card className="bg-muted/30 border-border">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm">Fuel Type Distribution</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="h-[200px] min-h-[200px]">
                                                    {!inventoryLoading && fuelChartData.length > 0 ? (
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart
                                                                data={fuelChartData}
                                                                margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                                                            >
                                                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0 0)" vertical={false} />
                                                                <XAxis
                                                                    dataKey="fuelType"
                                                                    tick={{ fill: "oklch(0.45 0 0)", fontSize: 10 }}
                                                                    axisLine={{ stroke: "oklch(0.88 0 0)" }}
                                                                    tickLine={false}
                                                                />
                                                                <YAxis
                                                                    tick={{ fill: "oklch(0.45 0 0)", fontSize: 10 }}
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    width={30}
                                                                />
                                                                <Tooltip
                                                                    contentStyle={{
                                                                        backgroundColor: "oklch(1 0 0)",
                                                                        border: "1px solid oklch(0.88 0 0)",
                                                                        borderRadius: "8px",
                                                                        color: "oklch(0.145 0 0)",
                                                                    }}
                                                                    labelStyle={{ color: "oklch(0.145 0 0)" }}
                                                                    formatter={(value: number) => [`${value} cars`, "Count"]}
                                                                />
                                                                <Bar dataKey="count" fill="oklch(0.5 0.16 215)" radius={[4, 4, 0, 0]} />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                                            No data available
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    )
}
