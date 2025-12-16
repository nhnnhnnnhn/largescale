"use client"

import { Car, Store, AlertTriangle, Wrench } from "lucide-react"
import { useGetOverviewQuery } from "@/store/services/analyticsApi"

export function SidebarStats() {
    const { data, isLoading, error } = useGetOverviewQuery()

    if (isLoading) {
        return (
            <div className="space-y-2 p-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 animate-pulse">
                        <div className="h-8 w-8 rounded-lg bg-gray-200" />
                        <div className="flex-1 space-y-1">
                            <div className="h-3 w-16 bg-gray-200 rounded" />
                            <div className="h-4 w-12 bg-gray-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (error || !data?.data) {
        return (
            <div className="p-4 text-center text-sm text-gray-500">
                Failed to load stats
            </div>
        )
    }

    const overview = data.data

    const stats = [
        {
            title: "Total Cars",
            value: overview.total_cars.toLocaleString(),
            icon: Car,
            color: "#2563eb",
            bgColor: "#dbeafe",
        },
        {
            title: "Total Dealers",
            value: overview.total_dealers.toLocaleString(),
            icon: Store,
            color: "#3b82f6",
            bgColor: "#bfdbfe",
        },
        {
            title: "Total Accidents",
            value: overview.total_accidents.toLocaleString(),
            icon: AlertTriangle,
            color: "#1d4ed8",
            bgColor: "#93c5fd",
        },
        {
            title: "Total Services",
            value: overview.total_services.toLocaleString(),
            icon: Wrench,
            color: "#60a5fa",
            bgColor: "#60a5fa30",
        },
    ]

    return (
        <div className="space-y-2 p-4">
            {stats.map((stat) => (
                <div
                    key={stat.title}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: stat.bgColor }}
                    >
                        <stat.icon
                            className="h-4 w-4"
                            style={{ color: stat.color }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">{stat.title}</p>
                        <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
