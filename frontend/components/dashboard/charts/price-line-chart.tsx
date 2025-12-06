"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useGetPriceDistributionQuery } from "@/store/services/analyticsApi"

export function PriceLineChart() {
  const { data, isLoading, error } = useGetPriceDistributionQuery({ bins: 10 })

  // Format data for display
  const chartData = data?.data?.map((item: any) => ({
    range: `£${(item._id / 1000).toFixed(0)}k`,
    count: item.count,
    price: item._id,
  })) || []

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Price Distribution</CardTitle>
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
                  dataKey="range"
                  tick={{ fill: "oklch(0.45 0 0)", fontSize: 11 }}
                  axisLine={{ stroke: "oklch(0.88 0 0)" }}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
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
                  formatter={(value: any) => [`${value} cars`, "Count"]}
                />
                <Bar
                  dataKey="count"
                  fill="oklch(0.45 0.18 230)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

