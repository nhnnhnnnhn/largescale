"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Terminal, Play, Copy, Check } from "lucide-react"

interface QueryPanelProps {
  filters: {
    manufacturer: string
    fuelType: string
    city: string
    year: string
    priceMin: number
    priceMax: number
    mileageMin: number
    mileageMax: number
  }
}

export function QueryPanel({ filters }: QueryPanelProps) {
  const [copied, setCopied] = useState(false)

  // Generate MongoDB query based on current filters
  const generateQuery = () => {
    const conditions: string[] = []

    if (filters.manufacturer && filters.manufacturer !== "all") {
      conditions.push(`  Manufacturer: "${filters.manufacturer}"`)
    }
    if (filters.fuelType && filters.fuelType !== "all") {
      conditions.push(`  FuelType: "${filters.fuelType}"`)
    }
    if (filters.city && filters.city !== "all") {
      conditions.push(`  DealerCity: "${filters.city}"`)
    }
    if (filters.year && filters.year !== "all") {
      conditions.push(`  YearOfManufacturing: ${filters.year}`)
    }
    conditions.push(`  Price: { $gte: ${filters.priceMin}, $lte: ${filters.priceMax} }`)
    conditions.push(`  Mileage: { $gte: ${filters.mileageMin}, $lte: ${filters.mileageMax} }`)

    return `db.carSales.find({\n${conditions.join(",\n")}\n})`
  }

  const query = generateQuery()

  const handleCopy = () => {
    navigator.clipboard.writeText(query)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            MongoDB Query
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Live Preview
            </Badge>
            <Button size="sm" variant="ghost" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Textarea
            value={query}
            readOnly
            className="font-mono text-xs bg-background border-border min-h-[140px] resize-none text-muted-foreground"
          />
          <Button size="sm" className="absolute bottom-3 right-3 bg-primary hover:bg-primary/90">
            <Play className="h-3 w-3 mr-1" />
            Execute
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
