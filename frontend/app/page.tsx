"use client"

import { StatsCards } from "@/components/dashboard/stats-cards"
import { ManufacturerBarChart } from "@/components/dashboard/charts/manufacturer-bar-chart"
import { FuelTypePieChart } from "@/components/dashboard/charts/fuel-type-pie-chart"
import { CombinedTrendsChart } from "@/components/dashboard/charts/combined-trends-chart"
import { AccidentSeverityChart } from "@/components/dashboard/charts/accident-severity-chart"
import { PriceDistributionChart } from "@/components/dashboard/charts/price-distribution-chart"
import { DealerSalesChart } from "@/components/dashboard/charts/dealer-sales-chart"

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-900">Car Sales Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">MongoDB-based interactive data exploration</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Stats Cards - 4 equal columns */}
                <StatsCards />

                {/* Charts Grid - 3 columns, 2 rows */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Row 1 */}
                    <ManufacturerBarChart />
                    <FuelTypePieChart />
                    <CombinedTrendsChart />

                    {/* Row 2 */}
                    <AccidentSeverityChart />
                    <PriceDistributionChart />
                    <DealerSalesChart />
                </div>
            </div>
        </div>
    )
}
