"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, Car, MapPin, DollarSign, Search, ArrowUpDown, X } from "lucide-react"
import { useGetDealersQuery, useGetDealerInventoryQuery } from "@/store/services/dealersApi"
import { useGetOverviewQuery } from "@/store/services/analyticsApi"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    BarChart,
    Bar,
} from "recharts"

interface DealerStats {
    dealer_id: string
    name: string
    city: string
    latitude: number
    longitude: number
    total_cars: number
    average_price: number
}

type SortField = "name" | "city" | "total_cars" | "average_price"
type SortDirection = "asc" | "desc"

export default function DealersPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [sortField, setSortField] = useState<SortField>("total_cars")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
    const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null)

    // Fetch dealers from backend
    const { data: dealersData, isLoading: dealersLoading, error: dealersError } = useGetDealersQuery()
    const { data: overviewData } = useGetOverviewQuery()

    // Fetch inventory for selected dealer
    const { data: inventoryData, isLoading: inventoryLoading } = useGetDealerInventoryQuery(
        { id: selectedDealerId!, page: 1, limit: 100 },
        { skip: !selectedDealerId }
    )

    const dealers = dealersData?.data || []

    const filteredDealers = useMemo(() => {
        let result = [...dealers]

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
                case "total_cars":
                    comparison = (a.statistics?.total_cars || 0) - (b.statistics?.total_cars || 0)
                    break
                case "average_price":
                    comparison = (a.statistics?.average_price || 0) - (b.statistics?.average_price || 0)
                    break
            }
            return sortDirection === "desc" ? -comparison : comparison
        })

        return result
    }, [dealers, searchQuery, sortField, sortDirection])

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    const selectedDealer = dealers.find(d => d.dealer_id === selectedDealerId)

    // Calculate fuel distribution from inventory
    const fuelChartData = useMemo(() => {
        if (!inventoryData?.data?.cars) return []

        const distribution: Record<string, number> = {}
        inventoryData.data.cars.forEach((car: any) => {
            const fuelType = car.specifications?.fuel_type || 'Unknown'
            distribution[fuelType] = (distribution[fuelType] || 0) + 1
        })

        return Object.entries(distribution).map(([name, value]) => ({ name, value }))
    }, [inventoryData])

    // Calculate manufacturer distribution from inventory
    const manufacturerChartData = useMemo(() => {
        if (!inventoryData?.data?.cars) return []

        const distribution: Record<string, number> = {}
        inventoryData.data.cars.forEach((car: any) => {
            const manufacturer = car.manufacturer || 'Unknown'
            distribution[manufacturer] = (distribution[manufacturer] || 0) + 1
        })

        return Object.entries(distribution)
            .map(([manufacturer, count]) => ({ manufacturer, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
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
        <div className="min-h-screen bg-background">
            <Header
                title="Dealers"
                subtitle="Dealer network and performance analytics"
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
                                    <p className="text-xl font-semibold">{dealers.length}</p>
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
                                    <p className="text-xs text-muted-foreground">Total Cars</p>
                                    <p className="text-xl font-semibold">{overviewData?.data?.total_cars || 0}</p>
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
                                    <p className="text-xs text-muted-foreground">Avg Dealer Size</p>
                                    <p className="text-xl font-semibold">
                                        {dealers.length > 0
                                            ? Math.round(dealers.reduce((sum, d) => sum + (d.statistics?.total_cars || 0), 0) / dealers.length)
                                            : 0}
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
                                        £{overviewData?.data?.average_price?.toLocaleString() || 0}
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
                                        <SortableHeader field="total_cars">Total Cars</SortableHeader>
                                        <SortableHeader field="average_price">Avg Price</SortableHeader>
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
                                                key={dealer.dealer_id}
                                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => setSelectedDealerId(dealer.dealer_id)}
                                            >
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {dealer.dealer_id}
                                                </TableCell>
                                                <TableCell className="font-medium">{dealer.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {dealer.city}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{dealer.statistics?.total_cars || 0}</Badge>
                                                </TableCell>
                                                <TableCell className="font-semibold text-primary">
                                                    £{dealer.statistics?.average_price?.toLocaleString() || 0}
                                                </TableCell>
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
            <Dialog open={!!selectedDealerId} onOpenChange={(open) => !open && setSelectedDealerId(null)}>
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
                            {inventoryLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Dealer Info */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <p className="text-xs text-muted-foreground mb-1">Total Cars</p>
                                            <p className="text-2xl font-bold">{selectedDealer.statistics?.total_cars || 0}</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <p className="text-xs text-muted-foreground mb-1">Avg Price</p>
                                            <p className="text-2xl font-bold text-primary">
                                                £{((selectedDealer.statistics?.average_price || 0) / 1000).toFixed(1)}K
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <p className="text-xs text-muted-foreground mb-1">In Stock</p>
                                            <p className="text-2xl font-bold">{inventoryData?.data?.cars?.length || 0}</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <p className="text-xs text-muted-foreground mb-1">Location</p>
                                            <p className="text-sm font-mono">
                                                {selectedDealer.location?.coordinates?.[1]?.toFixed(4)},{" "}
                                                {selectedDealer.location?.coordinates?.[0]?.toFixed(4)}
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
                                                    {fuelChartData.length > 0 ? (
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
                                                                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                                                    labelLine={false}
                                                                >
                                                                    {fuelChartData.map((_, index) => (
                                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip
                                                                    contentStyle={{
                                                                        backgroundColor: "oklch(1 0 0)",
                                                                        border: "1px solid oklch(0.88 0 0)",
                                                                        borderRadius: "8px",
                                                                        color: "oklch(0.145 0 0)",
                                                                    }}
                                                                    labelStyle={{ color: "oklch(0.145 0 0)" }}
                                                                    itemStyle={{ color: "oklch(0.145 0 0)" }}
                                                                    formatter={(value) => [`${value} vehicles`, "Count"]}
                                                                />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                                            No data available
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Top Manufacturers */}
                                        <Card className="bg-muted/30 border-border">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm">Top Manufacturers</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="h-[200px]">
                                                    {manufacturerChartData.length > 0 ? (
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart
                                                                data={manufacturerChartData}
                                                                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                                                            >
                                                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0 0)" vertical={false} />
                                                                <XAxis
                                                                    dataKey="manufacturer"
                                                                    tick={{ fill: "oklch(0.45 0 0)", fontSize: 11 }}
                                                                    axisLine={{ stroke: "oklch(0.88 0 0)" }}
                                                                    tickLine={false}
                                                                />
                                                                <YAxis
                                                                    tick={{ fill: "oklch(0.45 0 0)", fontSize: 11 }}
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                />
                                                                <Tooltip
                                                                    contentStyle={{
                                                                        backgroundColor: "oklch(1 0 0)",
                                                                        border: "1px solid oklch(0.88 0 0)",
                                                                        borderRadius: "8px",
                                                                        color: "oklch(0.145 0 0)",
                                                                    }}
                                                                    labelStyle={{ color: "oklch(0.145 0 0)" }}
                                                                    itemStyle={{ color: "oklch(0.145 0 0)" }}
                                                                    formatter={(value) => [`${value} cars`, "Count"]}
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
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
