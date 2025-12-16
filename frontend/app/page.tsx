"use client"

import { ManufacturerBarChart } from "@/components/dashboard/charts/manufacturer-bar-chart"
import { FuelTypePieChart } from "@/components/dashboard/charts/fuel-type-pie-chart"
import { CombinedTrendsChart } from "@/components/dashboard/charts/combined-trends-chart"
import { AccidentSeverityChart } from "@/components/dashboard/charts/accident-severity-chart"
import { PriceDistributionChart } from "@/components/dashboard/charts/price-distribution-chart"
import { DealerSalesChart } from "@/components/dashboard/charts/dealer-sales-chart"

export default function DashboardPage() {
    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Header - fixed height */}
            <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center flex-shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                </div>
            </div>

            {/* Charts Grid - fills remaining space */}
            <div className="flex-1 p-4 overflow-hidden">
                <div className="grid grid-cols-3 grid-rows-2 gap-4 h-full">
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

