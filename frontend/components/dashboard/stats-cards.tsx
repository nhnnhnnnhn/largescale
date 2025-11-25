"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Car, DollarSign, Gauge, Wrench } from "lucide-react"
import { useGetOverviewQuery } from "@/store/services/analyticsApi"

export function StatsCards() {
  const { data, isLoading, error } = useGetOverviewQuery()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/50 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-20 bg-muted/50 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-muted/50 rounded animate-pulse" />
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-full bg-card border-border">
          <CardContent className="p-4 text-center text-muted-foreground">
            Failed to load statistics
          </CardContent>
        </Card>
      </div>
    )
  }

  const overview = data.data

  const stats = [
    {
      title: "Total Vehicles",
      value: overview.total_cars,
      icon: Car,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Average Price",
      value: `£${overview.average_price.toLocaleString()}`,
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Total Services",
      value: overview.total_services.toLocaleString(),
      icon: Wrench,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Total Dealers",
      value: overview.total_dealers,
      icon: Gauge,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <p className="text-xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
