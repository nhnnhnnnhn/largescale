"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useGetTopDealersQuery } from "@/store/services/analyticsApi"

// Blue gradient for dealer bars
const COLORS = [
    "#1e3a8a", // Blue 900 - top dealer
    "#1e40af", // Blue 800
    "#1d4ed8", // Blue 700
    "#2563eb", // Blue 600
    "#3b82f6", // Blue 500
    "#60a5fa", // Blue 400
    "#93c5fd", // Blue 300
    "#bfdbfe", // Blue 200
]

export function DealerSalesChart() {
    const { data, isLoading, error } = useGetTopDealersQuery({ limit: 8 })

    return (
        <Card className="bg-white border border-gray-200 shadow-sm h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-900">Top Dealers by Sales</CardTitle>
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
                            <BarChart
                                data={data.data}
                                layout="vertical"
                                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                <XAxis
                                    type="number"
                                    tick={{ fill: "#6b7280", fontSize: 11 }}
                                    axisLine={{ stroke: "#e5e7eb" }}
                                    tickLine={false}
                                    tickFormatter={(value) => `£${(value / 1000000).toFixed(1)}M`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="dealer_name"
                                    tick={{ fill: "#6b7280", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                    interval={0}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#ffffff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                    labelStyle={{ color: "#111827", fontWeight: 600 }}
                                    formatter={(value: number, name: string, props: any) => {
                                        if (name === "total_sales") {
                                            return [`£${value.toLocaleString()}`, `Sales (${props.payload.total_cars} cars)`]
                                        }
                                        return [value, name]
                                    }}
                                    labelFormatter={(label: string, payload: any) => {
                                        if (payload && payload[0]) {
                                            return `${payload[0].payload.dealer_name} - ${payload[0].payload.dealer_city}`
                                        }
                                        return label
                                    }}
                                />
                                <Bar dataKey="total_sales" radius={[0, 4, 4, 0]}>
                                    {data.data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
