"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useGetAccidentSeverityQuery } from "@/store/services/analyticsApi"

export function AccidentSeverityChart() {
    const { data, isLoading, error } = useGetAccidentSeverityQuery()

    // Group data by manufacturer and severity
    const chartData = data?.data?.reduce((acc: any[], item) => {
        const existingManufacturer = acc.find(m => m.manufacturer === item.manufacturer)
        if (existingManufacturer) {
            existingManufacturer[item.severity] = item.count
        } else {
            acc.push({
                manufacturer: item.manufacturer,
                [item.severity]: item.count
            })
        }
        return acc
    }, []) || []

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Accident Severity by Manufacturer</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[280px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : error || !data?.data ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Failed to load data
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0 0)" vertical={false} />
                                <XAxis
                                    dataKey="manufacturer"
                                    tick={{ fill: "oklch(0.45 0 0)", fontSize: 11 }}
                                    axisLine={{ stroke: "oklch(0.88 0 0)" }}
                                    tickLine={false}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
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
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: 12 }}
                                    formatter={(value) => <span style={{ color: "oklch(0.145 0 0)" }}>{value}</span>}
                                />
                                <Bar dataKey="Minor" fill="oklch(0.5 0.16 215)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Moderate" fill="oklch(0.45 0.18 230)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Major" fill="oklch(0.35 0.15 250)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
