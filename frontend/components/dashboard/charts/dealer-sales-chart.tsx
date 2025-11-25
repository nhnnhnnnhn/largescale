"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useGetTopDealersQuery } from "@/store/services/analyticsApi"

export function DealerSalesChart() {
    const { data, isLoading, error } = useGetTopDealersQuery({ limit: 10 })

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Dealers by Sales Volume</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[320px]">
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
                            <BarChart
                                data={data.data}
                                layout="vertical"
                                margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" horizontal={false} />
                                <XAxis
                                    type="number"
                                    tick={{ fill: "oklch(0.65 0.01 260)", fontSize: 11 }}
                                    axisLine={{ stroke: "oklch(0.28 0.01 260)" }}
                                    tickLine={false}
                                    tickFormatter={(value) => `£${(value / 1000000).toFixed(1)}M`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="dealer_name"
                                    tick={{ fill: "oklch(0.65 0.01 260)", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "oklch(0.17 0.01 260)",
                                        border: "1px solid oklch(0.28 0.01 260)",
                                        borderRadius: "8px",
                                        color: "oklch(0.95 0.01 260)",
                                    }}
                                    labelStyle={{ color: "oklch(0.95 0.01 260)" }}
                                    itemStyle={{ color: "oklch(0.95 0.01 260)" }}
                                    formatter={(value: any, name: string, props: any) => {
                                        if (name === "total_sales") {
                                            return [
                                                `£${value.toLocaleString()}`,
                                                `Total Sales (${props.payload.total_cars} cars)`
                                            ]
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
                                <Bar
                                    dataKey="total_sales"
                                    fill="oklch(0.55 0.2 160)"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
