"use client"

import { Filter, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HeaderProps {
  title: string
  subtitle?: string
  filters?: {
    manufacturers?: string[]
    fuelTypes?: string[]
    cities?: string[]
    years?: number[]
  }
  selectedFilters?: {
    manufacturer: string
    fuelType: string
    city: string
    year: string
  }
  onFilterChange?: (key: string, value: string) => void
  onReset?: () => void
  showFilters?: boolean
}

export function Header({
  title,
  subtitle,
  filters,
  selectedFilters,
  onFilterChange,
  onReset,
  showFilters = true,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        {showFilters && filters && selectedFilters && onFilterChange && (
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />

            {filters.manufacturers && (
              <Select value={selectedFilters.manufacturer} onValueChange={(v) => onFilterChange("manufacturer", v)}>
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <SelectValue placeholder="Manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {filters.manufacturers.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {filters.fuelTypes && (
              <Select value={selectedFilters.fuelType} onValueChange={(v) => onFilterChange("fuelType", v)}>
                <SelectTrigger className="w-[120px] h-9 text-sm">
                  <SelectValue placeholder="Fuel Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fuels</SelectItem>
                  {filters.fuelTypes.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {filters.cities && (
              <Select value={selectedFilters.city} onValueChange={(v) => onFilterChange("city", v)}>
                <SelectTrigger className="w-[130px] h-9 text-sm">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {filters.cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {filters.years && (
              <Select value={selectedFilters.year} onValueChange={(v) => onFilterChange("year", v)}>
                <SelectTrigger className="w-[100px] h-9 text-sm">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {filters.years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {onReset && (
              <Button variant="ghost" size="sm" onClick={onReset} className="h-9">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
