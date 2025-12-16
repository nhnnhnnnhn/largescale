"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useGetServiceTrendsQuery, useGetAccidentTrendsQuery } from "@/store/services/analyticsApi"

// Line colors - blue for services, orange for accidents (warning)
const COLORS = {
    services: "#2F5BEA",   // Blue - operational
    accidents: "#F59E0B",  // Orange - warning
}

export function CombinedTrendsChart() {
    const { data: serviceData, isLoading: serviceLoading } = useGetServiceTrendsQuery({ months: 12 })
    const { data: accidentData, isLoading: accidentLoading } = useGetAccidentTrendsQuery({ months: 12 })

    const isLoading = serviceLoading || accidentLoading

    // Combine service and accident data by month
    const combinedData = serviceData?.data?.map((service) => {
        const accident = accidentData?.data?.find((a) => a.month === service.month)
        return {
            month: service.month,
            services: service.count,
            accidents: accident?.count || 0,
        }
    }) || []

    return (
        <Card className="bg-white border border-gray-200 shadow-sm h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-900">Services & Accidents Trends</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="h-[280px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : combinedData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No data available
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: "#6b7280", fontSize: 11 }}
                                    axisLine={{ stroke: "#e5e7eb" }}
                                    tickLine={false}
                                    tickFormatter={(value) => {
                                        const [year, month] = value.split('-')
                                        return `${month}/${year.slice(2)}`
                                    }}
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
                                    labelFormatter={(value) => {
                                        // Format: "2022-H1" or "2022-H2"
                                        const [year, half] = value.split('-')
                                        const halfLabel = half === 'H1' ? 'Jan-Jun' : 'Jul-Dec'
                                        return `${halfLabel} ${year}`
                                    }}
                                    itemStyle={{ color: "#111827" }}
                                />
                                <Legend
                                    wrapperStyle={{ paddingTop: "10px" }}
                                    formatter={(value) => <span style={{ color: "#374151" }}>{value}</span>}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="services"
                                    name="Services"
                                    stroke={COLORS.services}
                                    strokeWidth={2}
                                    dot={{ fill: COLORS.services, r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="accidents"
                                    name="Accidents"
                                    stroke={COLORS.accidents}
                                    strokeWidth={2}
                                    dot={{ fill: COLORS.accidents, r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
