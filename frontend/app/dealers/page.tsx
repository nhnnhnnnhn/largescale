"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useFilters } from "@/lib/filter-context"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, Car, MapPin, DollarSign, Search, ArrowUpDown, X } from "lucide-react"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    LineChart,
    Line,
} from "recharts"

interface DealerStats {
    id: string
    name: string
    city: string
    latitude: number
    longitude: number
    totalCars: number
    avgPrice: number
    totalValue: number
    fuelDistribution: Record<string, number>
    yearPriceData: { year: number; avgPrice: number }[]
}

type SortField = "name" | "city" | "totalCars" | "avgPrice"
type SortDirection = "asc" | "desc"

export default function DealersPage() {
    const { filters, setFilter, resetFilters, filteredData, filterOptions } = useFilters()
    const [searchQuery, setSearchQuery] = useState("")
    const [sortField, setSortField] = useState<SortField>("totalCars")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
    const [selectedDealer, setSelectedDealer] = useState<DealerStats | null>(null)

    const dealerStats = useMemo(() => {
        const stats: Record<string, DealerStats> = {}
        let dealerIndex = 1

        filteredData.forEach((car) => {
            if (!stats[car.DealerName]) {
                stats[car.DealerName] = {
                    id: `DLR${String(dealerIndex++).padStart(3, "0")}`,
                    name: car.DealerName,
                    city: car.DealerCity,
                    latitude: car.Latitude,
                    longitude: car.Longitude,
                    totalCars: 0,
                    avgPrice: 0,
                    totalValue: 0,
                    fuelDistribution: {},
                    yearPriceData: [],
                }
            }

            stats[car.DealerName].totalCars += 1
            stats[car.DealerName].totalValue += car.Price
            stats[car.DealerName].fuelDistribution[car.FuelType] =
                (stats[car.DealerName].fuelDistribution[car.FuelType] || 0) + 1
        })

        // Calculate avg price and year-price data for each dealer
        Object.keys(stats).forEach((dealerName) => {
            const dealer = stats[dealerName]
            dealer.avgPrice = Math.round(dealer.totalValue / dealer.totalCars)

            // Calculate avg price by year
            const yearData: Record<number, { total: number; count: number }> = {}
            filteredData
                .filter((car) => car.DealerName === dealerName)
                .forEach((car) => {
                    if (!yearData[car.Year]) {
                        yearData[car.Year] = { total: 0, count: 0 }
                    }
                    yearData[car.Year].total += car.Price
                    yearData[car.Year].count += 1
                })

            dealer.yearPriceData = Object.entries(yearData)
                .map(([year, data]) => ({
                    year: Number.parseInt(year),
                    avgPrice: Math.round(data.total / data.count),
                }))
                .sort((a, b) => a.year - b.year)
        })

        return Object.values(stats)
    }, [filteredData])

    const filteredDealers = useMemo(() => {
        let result = dealerStats

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (dealer) => dealer.name.toLowerCase().includes(query) || dealer.city.toLowerCase().includes(query),
            )
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0
            switch (sortField) {
                case "name":
                    comparison = a.name.localeCompare(b.name)
                    break
                case "city":
                    comparison = a.city.localeCompare(b.city)
                    break
                case "totalCars":
                    comparison = a.totalCars - b.totalCars
                    break
                case "avgPrice":
                    comparison = a.avgPrice - b.avgPrice
                    break
            }
            return sortDirection === "desc" ? -comparison : comparison
        })

        return result
    }, [dealerStats, searchQuery, sortField, sortDirection])

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
        <TableHead className="cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort(field)}>
            <div className="flex items-center gap-1">
                {children}
                <ArrowUpDown className={`h-3 w-3 ${sortField === field ? "text-primary" : "text-muted-foreground"}`} />
            </div>
        </TableHead>
    )

    // Chart colors
    const FUEL_COLORS = ["oklch(0.65 0.18 250)", "oklch(0.55 0.2 160)", "oklch(0.65 0.2 45)", "oklch(0.6 0.2 330)"]

    // Fuel chart data for selected dealer
    const fuelChartData = selectedDealer
        ? Object.entries(selectedDealer.fuelDistribution).map(([name, value]) => ({
            name,
            value,
        }))
        : []

    return (
        <div className="min-h-screen bg-background">
            <Header
                title="Dealers"
                subtitle="Dealer network and performance analytics"
                filters={{
                    cities: filterOptions.cities,
                    fuelTypes: filterOptions.fuelTypes,
                }}
                selectedFilters={filters}
                onFilterChange={setFilter}
                onReset={resetFilters}
            />

            <div className="p-6 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-card border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Building2 className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Dealers</p>
                                    <p className="text-xl font-semibold">{dealerStats.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-accent/10">
                                    <Car className="h-5 w-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Inventory</p>
                                    <p className="text-xl font-semibold">{filteredData.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-chart-3/10">
                                    <DollarSign className="h-5 w-5 text-chart-3" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Value</p>
                                    <p className="text-xl font-semibold">
                                        £{Math.round(filteredData.reduce((sum, c) => sum + c.Price, 0) / 1000)}K
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-chart-4/10">
                                    <DollarSign className="h-5 w-5 text-chart-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Avg Price</p>
                                    <p className="text-xl font-semibold">
                                        £
                                        {Math.round(
                                            filteredData.reduce((sum, c) => sum + c.Price, 0) / filteredData.length,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Bar */}
                <Card className="bg-card border-border">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by dealer name or city..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-muted/50 border-border"
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                    onClick={() => setSearchQuery("")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Dealers Table */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Dealer List</CardTitle>
                            <Badge variant="secondary">{filteredDealers.length} dealers</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead className="w-[100px]">Dealer ID</TableHead>
                                        <SortableHeader field="name">Dealer Name</SortableHeader>
                                        <SortableHeader field="city">City</SortableHeader>
                                        <SortableHeader field="totalCars">Total Cars</SortableHeader>
                                        <SortableHeader field="avgPrice">Avg Price</SortableHeader>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDealers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No dealers found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredDealers.map((dealer) => (
                                            <TableRow
                                                key={dealer.id}
                                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => setSelectedDealer(dealer)}
                                            >
                                                <TableCell className="font-mono text-xs text-muted-foreground">{dealer.id}</TableCell>
                                                <TableCell className="font-medium">{dealer.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {dealer.city}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{dealer.totalCars}</Badge>
                                                </TableCell>
                                                <TableCell className="font-semibold text-accent">£{dealer.avgPrice.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dealer Detail Modal */}
            <Dialog open={!!selectedDealer} onOpenChange={(open) => !open && setSelectedDealer(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-card border-border">
                    <DialogHeader className="pb-4 border-b border-border">
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            {selectedDealer?.name}
                        </DialogTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {selectedDealer?.city}
                        </div>
                    </DialogHeader>

                    {selectedDealer && (
                        <div className="flex-1 overflow-y-auto p-1 space-y-6">
                            {/* Dealer Info */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <p className="text-xs text-muted-foreground mb-1">Total Cars</p>
                                    <p className="text-2xl font-bold">{selectedDealer.totalCars}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <p className="text-xs text-muted-foreground mb-1">Avg Price</p>
                                    <p className="text-2xl font-bold text-accent">£{(selectedDealer.avgPrice / 1000).toFixed(1)}K</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                                    <p className="text-2xl font-bold">£{Math.round(selectedDealer.totalValue / 1000)}K</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                                    <p className="text-sm font-mono">
                                        {selectedDealer.latitude.toFixed(4)}, {selectedDealer.longitude.toFixed(4)}
                                    </p>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Fuel Type Distribution */}
                                <Card className="bg-muted/30 border-border">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Fuel Type Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[200px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={fuelChartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={45}
                                                        outerRadius={75}
                                                        paddingAngle={3}
                                                        dataKey="value"
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        labelLine={false}
                                                    >
                                                        {fuelChartData.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={FUEL_COLORS[index % FUEL_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: "oklch(0.17 0.01 260)",
                                                            border: "1px solid oklch(0.28 0.01 260)",
                                                            borderRadius: "8px",
                                                            color: "oklch(0.95 0.01 260)",
                                                        }}
                                                        labelStyle={{ color: "oklch(0.95 0.01 260)" }}
                                                        itemStyle={{ color: "oklch(0.85 0.01 260)" }}
                                                        formatter={(value) => [`${value} vehicles`, "Count"]}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Avg Price by Year */}
                                <Card className="bg-muted/30 border-border">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Avg Price by Manufacturing Year</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[200px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={selectedDealer.yearPriceData}
                                                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" vertical={false} />
                                                    <XAxis
                                                        dataKey="year"
                                                        tick={{ fill: "oklch(0.65 0.01 260)", fontSize: 11 }}
                                                        axisLine={{ stroke: "oklch(0.28 0.01 260)" }}
                                                        tickLine={false}
                                                    />
                                                    <YAxis
                                                        tick={{ fill: "oklch(0.65 0.01 260)", fontSize: 11 }}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tickFormatter={(value) => `£${(value / 1000).toFixed(0)}K`}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: "oklch(0.17 0.01 260)",
                                                            border: "1px solid oklch(0.28 0.01 260)",
                                                            borderRadius: "8px",
                                                        }}
                                                        labelStyle={{ color: "oklch(0.95 0.01 260)" }}
                                                        itemStyle={{ color: "oklch(0.85 0.01 260)" }}
                                                        formatter={(value) => [`£${Number(value).toLocaleString()}`, "Avg Price"]}
                                                        labelFormatter={(label) => `Year: ${label}`}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="avgPrice"
                                                        stroke="oklch(0.55 0.2 160)"
                                                        strokeWidth={2}
                                                        dot={{ fill: "oklch(0.55 0.2 160)", strokeWidth: 0, r: 4 }}
                                                        activeDot={{ r: 6, fill: "oklch(0.55 0.2 160)" }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
