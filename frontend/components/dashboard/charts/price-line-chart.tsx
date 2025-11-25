"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PriceLineChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Price Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] flex items-center justify-center text-muted-foreground">
          Chart temporarily disabled
        </div>
      </CardContent>
    </Card>
  )
}
