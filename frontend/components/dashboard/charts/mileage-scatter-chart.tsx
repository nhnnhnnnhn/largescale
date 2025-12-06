"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts"
import { useGetMileagePriceQuery } from "@/store/services/analyticsApi"

export function MileageScatterChart() {
    const { data, isLoading, error } = useGetMileagePriceQuery({ limit: 500 })

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Mileage vs Price</CardTitle>
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
                            <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0 0)" />
                                <XAxis
                                    type="number"
                                    dataKey="mileage"
                                    name="Mileage"
                                    tick={{ fill: "oklch(0.45 0 0)", fontSize: 11 }}
                                    axisLine={{ stroke: "oklch(0.88 0 0)" }}
                                    tickLine={false}
                                    label={{ value: "Mileage", position: "insideBottom", offset: -5, fill: "oklch(0.45 0 0)", fontSize: 11 }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="price"
                                    name="Price"
                                    tick={{ fill: "oklch(0.45 0 0)", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    label={{ value: "Price (£)", angle: -90, position: "insideLeft", fill: "oklch(0.45 0 0)", fontSize: 11 }}
                                />
                                <ZAxis range={[50, 50]} />
                                <Tooltip
                                    cursor={{ strokeDasharray: "3 3" }}
                                    contentStyle={{
                                        backgroundColor: "oklch(1 0 0)",
                                        border: "1px solid oklch(0.88 0 0)",
                                        borderRadius: "8px",
                                        color: "oklch(0.145 0 0)",
                                    }}
                                    labelStyle={{ color: "oklch(0.145 0 0)" }}
                                    itemStyle={{ color: "oklch(0.145 0 0)" }}
                                    formatter={(value: any, name: string) => {
                                        if (name === "price") return [`£${value.toLocaleString()}`, "Price"]
                                        if (name === "mileage") return [value.toLocaleString(), "Mileage"]
                                        return [value, name]
                                    }}
                                    labelFormatter={(props: any) => {
                                        if (props && data?.data) {
                                            return `${props.manufacturer} ${props.model}`
                                        }
                                        return ""
                                    }}
                                />
                                <Scatter
                                    name="Cars"
                                    data={data.data}
                                    fill="oklch(0.45 0.18 230)"
                                    fillOpacity={0.6}
                                />
                            </ScatterChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
