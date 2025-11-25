"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useGetByManufacturerQuery } from "@/store/services/analyticsApi"

export function ManufacturerBarChart() {
  const { data, isLoading, error } = useGetByManufacturerQuery()

  const colors = [
    "oklch(0.65 0.18 250)",
    "oklch(0.55 0.2 160)",
    "oklch(0.65 0.2 45)",
    "oklch(0.6 0.2 330)",
    "oklch(0.7 0.15 200)",
    "oklch(0.6 0.15 280)",
    "oklch(0.7 0.18 120)",
    "oklch(0.55 0.18 20)",
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Sales by Manufacturer</CardTitle>
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
              <BarChart data={data.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" vertical={false} />
                <XAxis
                  dataKey="manufacturer"
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
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
