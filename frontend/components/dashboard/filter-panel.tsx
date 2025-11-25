"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Filter, RotateCcw } from "lucide-react"

interface FilterPanelProps {
  manufacturers: string[]
  fuelTypes: string[]
  cities: string[]
  years: number[]
  priceRange: { min: number; max: number }
  mileageRange: { min: number; max: number }
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
  onFilterChange: (key: string, value: string | number) => void
  onReset: () => void
}

export function FilterPanel({
  manufacturers,
  fuelTypes,
  cities,
  years,
  priceRange,
  mileageRange,
  filters,
  onFilterChange,
  onReset,
}: FilterPanelProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filters
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Manufacturer Dropdown */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Manufacturer</Label>
          <Select value={filters.manufacturer} onValueChange={(v) => onFilterChange("manufacturer", v)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="All Manufacturers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manufacturers</SelectItem>
              {manufacturers.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fuel Type Dropdown */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Fuel Type</Label>
          <Select value={filters.fuelType} onValueChange={(v) => onFilterChange("fuelType", v)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="All Fuel Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fuel Types</SelectItem>
              {fuelTypes.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dealer City Dropdown */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Dealer City</Label>
          <Select value={filters.city} onValueChange={(v) => onFilterChange("city", v)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Dropdown */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Year of Manufacturing</Label>
          <Select value={filters.year} onValueChange={(v) => onFilterChange("year", v)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Price Range</Label>
            <span className="text-xs text-primary font-mono">
              £{filters.priceMin.toLocaleString()} - £{filters.priceMax.toLocaleString()}
            </span>
          </div>
          <Slider
            min={priceRange.min}
            max={priceRange.max}
            step={1000}
            value={[filters.priceMin, filters.priceMax]}
            onValueChange={([min, max]) => {
              onFilterChange("priceMin", min)
              onFilterChange("priceMax", max)
            }}
            className="py-2"
          />
        </div>

        {/* Mileage Range Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Mileage Range</Label>
            <span className="text-xs text-accent font-mono">
              {filters.mileageMin.toLocaleString()} - {filters.mileageMax.toLocaleString()} mi
            </span>
          </div>
          <Slider
            min={mileageRange.min}
            max={mileageRange.max}
            step={1000}
            value={[filters.mileageMin, filters.mileageMax]}
            onValueChange={([min, max]) => {
              onFilterChange("mileageMin", min)
              onFilterChange("mileageMax", max)
            }}
            className="py-2"
          />
        </div>
      </CardContent>
    </Card>
  )
}
