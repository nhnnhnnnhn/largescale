"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useGetByFuelTypeQuery } from "@/store/services/analyticsApi"

// Blue-based color palette for pie segments
const COLORS = [
  "#1e40af", // Blue 800 - Diesel
  "#3b82f6", // Blue 500 - Petrol
  "#60a5fa", // Blue 400 - Hybrid
  "#93c5fd", // Blue 300
  "#bfdbfe", // Blue 200
]

export function FuelTypePieChart() {
  const { data, isLoading, error } = useGetByFuelTypeQuery()

  return (
    <Card className="bg-white border border-gray-200 shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-900">Fuel Type Distribution</CardTitle>
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
              <PieChart>
                <Pie
                  data={data.data.map((item) => ({ name: item.fuel_type, value: item.count, percentage: item.percentage }))}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ percentage }) => `${percentage}%`}
                  labelLine={{ stroke: "#6b7280" }}
                >
                  {data.data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                />
                <Legend
                  wrapperStyle={{ color: "#374151", fontSize: 13, paddingTop: "10px" }}
                  formatter={(value) => <span style={{ color: "#374151" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
