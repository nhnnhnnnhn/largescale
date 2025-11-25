"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useGetByFuelTypeQuery } from "@/store/services/analyticsApi"

export function FuelTypePieChart() {
  const { data, isLoading, error } = useGetByFuelTypeQuery()

  const COLORS = [
    "oklch(0.65 0.18 250)", // Primary blue
    "oklch(0.55 0.2 160)", // Accent teal
    "oklch(0.65 0.2 45)", // Orange
    "oklch(0.6 0.2 330)", // Pink
    "oklch(0.7 0.15 200)", // Light blue
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Fuel Type Distribution</CardTitle>
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
              <PieChart>
                <Pie
                  data={data.data.map((item) => ({ name: item.fuel_type, value: item.count }))}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
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
                <Legend
                  wrapperStyle={{ color: "oklch(0.65 0.01 260)", fontSize: 12 }}
                  formatter={(value) => <span style={{ color: "oklch(0.95 0.01 260)" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
