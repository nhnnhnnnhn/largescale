"use client"

import { createContext, useContext, useState, useMemo, type ReactNode } from "react"
import {
  carSalesData,
  getManufacturers,
  getFuelTypes,
  getCities,
  getYears,
  getPriceRange,
  getMileageRange,
  type CarRecord,
} from "@/lib/car-data"

interface Filters {
  manufacturer: string
  fuelType: string
  city: string
  year: string
  priceMin: number
  priceMax: number
  mileageMin: number
  mileageMax: number
}

interface FilterContextType {
  filters: Filters
  setFilter: (key: string, value: string | number) => void
  resetFilters: () => void
  filteredData: CarRecord[]
  filterOptions: {
    manufacturers: string[]
    fuelTypes: string[]
    cities: string[]
    years: number[]
    priceRange: { min: number; max: number }
    mileageRange: { min: number; max: number }
  }
}

const FilterContext = createContext<FilterContextType | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const priceRange = getPriceRange()
  const mileageRange = getMileageRange()

  const [filters, setFilters] = useState<Filters>({
    manufacturer: "all",
    fuelType: "all",
    city: "all",
    year: "all",
    priceMin: priceRange.min,
    priceMax: priceRange.max,
    mileageMin: mileageRange.min,
    mileageMax: mileageRange.max,
  })

  const filterOptions = useMemo(
    () => ({
      manufacturers: getManufacturers(),
      fuelTypes: getFuelTypes(),
      cities: getCities(),
      years: getYears(),
      priceRange,
      mileageRange,
    }),
    [],
  )

  const setFilter = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      manufacturer: "all",
      fuelType: "all",
      city: "all",
      year: "all",
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      mileageMin: mileageRange.min,
      mileageMax: mileageRange.max,
    })
  }

  const filteredData = useMemo(() => {
    return carSalesData.filter((car) => {
      if (filters.manufacturer !== "all" && car.Manufacturer !== filters.manufacturer) return false
      if (filters.fuelType !== "all" && car.FuelType !== filters.fuelType) return false
      if (filters.city !== "all" && car.DealerCity !== filters.city) return false
      if (filters.year !== "all" && car.YearOfManufacturing !== Number.parseInt(filters.year)) return false
      if (car.Price < filters.priceMin || car.Price > filters.priceMax) return false
      if (car.Mileage < filters.mileageMin || car.Mileage > filters.mileageMax) return false
      return true
    })
  }, [filters])

  return (
    <FilterContext.Provider value={{ filters, setFilter, resetFilters, filteredData, filterOptions }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (!context) throw new Error("useFilters must be used within FilterProvider")
  return context
}
