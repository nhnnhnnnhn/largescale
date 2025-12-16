"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useGetAccidentSeverityQuery } from "@/store/services/analyticsApi"

// Severity colors - darker for more severe
const SEVERITY_COLORS = {
    Minor: "#C7DBFF",    // Lightest
    Moderate: "#78A6FF", // Medium light
    Major: "#4C7DFF",    // Medium dark
    Severe: "#1F3C88",   // Darkest
}

export function AccidentSeverityChart() {
    const { data, isLoading, error } = useGetAccidentSeverityQuery()

    // Group data by severity
    const chartData = data?.data?.reduce((acc: any, item) => {
        const existing = acc.find((s: any) => s.severity === item.severity)
        if (existing) {
            existing.count += item.count
        } else {
            acc.push({
                severity: item.severity,
                count: item.count,
            })
        }
        return acc
    }, [])?.sort((a: any, b: any) => {
        const order = ['Minor', 'Moderate', 'Major', 'Severe']
        return order.indexOf(a.severity) - order.indexOf(b.severity)
    }) || []

    return (
        <Card className="bg-white border border-gray-200 shadow-sm h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-900">Accident Severity Distribution</CardTitle>
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
                            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis
                                    dataKey="severity"
                                    tick={{ fill: "#6b7280", fontSize: 12 }}
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
                                    formatter={(value: number) => [value.toLocaleString(), "Accidents"]}
                                />
                                <Bar
                                    dataKey="count"
                                    radius={[4, 4, 0, 0]}
                                    fill="#3b82f6"
                                >
                                    {chartData.map((entry: any, index: number) => (
                                        <rect
                                            key={`bar-${index}`}
                                            fill={SEVERITY_COLORS[entry.severity as keyof typeof SEVERITY_COLORS] || "#3b82f6"}
                                        />
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
