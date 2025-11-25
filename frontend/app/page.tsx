"use client"

import { Header } from "@/components/layout/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { DataTable } from "@/components/dashboard/data-table"
import { ManufacturerBarChart } from "@/components/dashboard/charts/manufacturer-bar-chart"
import { FuelTypePieChart } from "@/components/dashboard/charts/fuel-type-pie-chart"
import { ServiceTrendChart } from "@/components/dashboard/charts/service-trend-chart"
import { AccidentSeverityChart } from "@/components/dashboard/charts/accident-severity-chart"
import { MileageScatterChart } from "@/components/dashboard/charts/mileage-scatter-chart"
import { PriceLineChart } from "@/components/dashboard/charts/price-line-chart"
import { DealerSalesChart } from "@/components/dashboard/charts/dealer-sales-chart"
import { useFilters } from "@/lib/filter-context"

export default function DashboardPage() {
    const { filters, setFilter, resetFilters, filterOptions } = useFilters()

    return (
        <div className="min-h-screen bg-background">
            <Header
                title="Dashboard"
                subtitle="Car sales analytics and insights"
                filters={{
                    manufacturers: filterOptions.manufacturers,
                    cities: filterOptions.cities,
                    fuelTypes: filterOptions.fuelTypes,
                    years: filterOptions.years,
                }}
                selectedFilters={filters}
                onFilterChange={setFilter}
                onReset={resetFilters}
            />

            <div className="p-6 space-y-6">
                <StatsCards />

                <div className="grid gap-6 md:grid-cols-2">
                    <ManufacturerBarChart />
                    <FuelTypePieChart />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <ServiceTrendChart />
                    <AccidentSeverityChart />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <MileageScatterChart />
                    <PriceLineChart />
                </div>

                <DealerSalesChart />

                <DataTable />
            </div>
        </div>
    )
}
