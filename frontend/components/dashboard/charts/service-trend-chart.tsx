"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useGetServiceTrendsQuery } from "@/store/services/analyticsApi"

export function ServiceTrendChart() {
  const { data, isLoading, error } = useGetServiceTrendsQuery({ months: 24 })

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Service Trends</CardTitle>
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
              <LineChart data={data.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "oklch(0.65 0.01 260)", fontSize: 11 }}
                  axisLine={{ stroke: "oklch(0.28 0.01 260)" }}
                  tickLine={false}
                />
                <YAxis tick={{ fill: "oklch(0.65 0.01 260)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.17 0.01 260)",
                    border: "1px solid oklch(0.28 0.01 260)",
                    borderRadius: "8px",
                    color: "oklch(0.95 0.01 260)",
                  }}
                  labelStyle={{ color: "oklch(0.95 0.01 260)" }}
                  itemStyle={{ color: "oklch(0.95 0.01 260)" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="oklch(0.55 0.2 160)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(0.55 0.2 160)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
