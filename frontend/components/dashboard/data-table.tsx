"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Database } from "lucide-react"
import { useGetCarsQuery } from "@/store/services/carsApi"
import { useGetDealersQuery } from "@/store/services/dealersApi"
import { transformCars } from "@/lib/transformers"
import { useMemo } from "react"

export function DataTable() {
  const { data: carsData, isLoading: carsLoading } = useGetCarsQuery({ page: 1, limit: 50 })
  const { data: dealersData, isLoading: dealersLoading } = useGetDealersQuery()

  const cars = useMemo(() => {
    if (!carsData?.data || !dealersData?.data) return []
    const dealersMap = new Map(dealersData.data.map((d) => [d.dealer_id, d]))
    return transformCars(carsData.data, dealersMap)
  }, [carsData, dealersData])

  const fuelTypeColors: Record<string, string> = {
    Petrol: "bg-chart-3/20 text-chart-3 border-chart-3/30",
    Diesel: "bg-chart-4/20 text-chart-4 border-chart-4/30",
    Hybrid: "bg-accent/20 text-accent border-accent/30",
    Electric: "bg-primary/20 text-primary border-primary/30",
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          Vehicle Records
          <Badge variant="secondary" className="ml-2">
            {cars.length} results
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {carsLoading || dealersLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-muted-foreground">Vehicle</TableHead>
                  <TableHead className="text-muted-foreground">Year</TableHead>
                  <TableHead className="text-muted-foreground">Fuel</TableHead>
                  <TableHead className="text-muted-foreground">Mileage</TableHead>
                  <TableHead className="text-muted-foreground">Price</TableHead>
                  <TableHead className="text-muted-foreground">Dealer</TableHead>
                  <TableHead className="text-muted-foreground">City</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.map((car) => (
                  <TableRow key={car.CarID} className="border-border hover:bg-muted/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">{car.CarID}</TableCell>
                    <TableCell className="font-medium">
                      {car.Manufacturer} {car.Model}
                    </TableCell>
                    <TableCell>{car.YearOfManufacturing}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={fuelTypeColors[car.FuelType] || ""}>
                        {car.FuelType}
                      </Badge>
                    </TableCell>
                    <TableCell>{car.Mileage.toLocaleString()} mi</TableCell>
                    <TableCell className="font-semibold text-accent">£{car.Price.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{car.DealerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{car.DealerCity}</TableCell>
                  </TableRow>
                ))}
                {cars.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No vehicles match your filters. Try adjusting your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
