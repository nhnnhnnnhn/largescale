"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useGetPriceDistributionQuery } from "@/store/services/analyticsApi"

// Darker blue color for histogram bars
const BAR_COLOR = "#4C7DFF"

export function PriceDistributionChart() {
    const { data, isLoading, error } = useGetPriceDistributionQuery({ bins: 10 })

    // Use the range field directly from API (now formatted as "0-10k", "10-20k", etc.)
    const chartData = data?.data?.map((item: any) => ({
        range: item.range,
        count: item.count,
        price: item._id,
    })) || []

    return (
        <Card className="bg-white border border-gray-200 shadow-sm h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-900">Price Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="h-[280px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error || !data?.data ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Failed to load data
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis
                                    dataKey="range"
                                    tick={{ fill: "#6b7280", fontSize: 11 }}
                                    axisLine={{ stroke: "#e5e7eb" }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#6b7280", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#ffffff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                    labelStyle={{ color: "#111827", fontWeight: 600 }}
                                    itemStyle={{ color: "#111827" }}
                                    formatter={(value: number) => [`${value.toLocaleString()} cars`, "Count"]}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill={BAR_COLOR} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
