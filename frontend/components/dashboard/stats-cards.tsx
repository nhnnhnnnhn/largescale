"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Car, Store, AlertTriangle, Wrench } from "lucide-react"
import { useGetOverviewQuery } from "@/store/services/analyticsApi"

// Blue color palette optimized for data visualization
const BLUE_COLORS = {
  primary: "#2563eb",    // Blue 600
  secondary: "#3b82f6",  // Blue 500
  accent: "#1d4ed8",     // Blue 700
  light: "#60a5fa",      // Blue 400
}

export function StatsCards() {
  const { data, isLoading, error } = useGetOverviewQuery()

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-100 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <div className="grid grid-cols-4 gap-4">
        <Card className="col-span-full bg-white border border-gray-200">
          <CardContent className="p-6 text-center text-gray-500">
            Failed to load statistics
          </CardContent>
        </Card>
      </div>
    )
  }

  const overview = data.data

  const stats = [
    {
      title: "Total Cars",
      value: overview.total_cars.toLocaleString(),
      icon: Car,
      color: BLUE_COLORS.primary,
      bgColor: "#dbeafe", // Blue 100
    },
    {
      title: "Total Dealers",
      value: overview.total_dealers.toLocaleString(),
      icon: Store,
      color: BLUE_COLORS.secondary,
      bgColor: "#bfdbfe", // Blue 200
    },
    {
      title: "Total Accidents",
      value: overview.total_accidents.toLocaleString(),
      icon: AlertTriangle,
      color: BLUE_COLORS.accent,
      bgColor: "#93c5fd", // Blue 300
    },
    {
      title: "Total Services",
      value: overview.total_services.toLocaleString(),
      icon: Wrench,
      color: BLUE_COLORS.light,
      bgColor: "#60a5fa", // Blue 400
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="py-1 px-2">
            <div className="flex items-center gap-1.5">
              <div
                className="p-1 rounded"
                style={{ backgroundColor: stat.bgColor }}
              >
                <stat.icon
                  className="h-5 w-5"
                  style={{ color: stat.color }}
                />
              </div>
              <div className="flex items-baseline gap-1.5">
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-base font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
